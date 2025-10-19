from typing import BinaryIO, Optional
import json

from atmst.mst.node import MSTNode
from atmst.mst.node_store import NodeStore
from atmst.mst.node_wrangler import NodeWrangler
from atmst.mst.node_walker import NodeWalker
from atmst.mst.diff import very_slow_mst_diff, record_diff
from atmst.blockstore import MemoryBlockStore, OverlayBlockStore, BlockStore
from atmst.blockstore.car_file import encode_varint
from atmst.mst import proof
import cbrrr
from cbrrr import CID


class LoggingBlockStoreWrapper(BlockStore):
    def __init__(self, bs: BlockStore):
        self.bs = bs
        self.gets = set()

    def put_block(self, key: bytes, value: bytes) -> None:
        self.bs.put_block(key, value)

    def get_block(self, key: bytes) -> bytes:
        self.gets.add(key)
        return self.bs.get_block(key)

    def del_block(self, key: bytes) -> None:
        self.bs.del_block(key)


"""
class LoggingNodeStore(NodeStore):
	def __init__(self, bs):
		self.read_cids = set()
		self.stored_cids = set()
		super().__init__(bs)

	def get_node(self, cid: Optional[CID]) -> MSTNode:
		if cid is None:
			self.read_cids.add(MSTNode.empty_root().cid)
		else:
			self.read_cids.add(cid)
		return super().get_node(cid)

	def stored_node(self, node: MSTNode) -> MSTNode:
		self.stored_cids.add(node.cid)
		return super().stored_node(node)
"""


class CarWriter:
    def __init__(self, stream: BinaryIO, root: cbrrr.CID) -> None:
        self.stream = stream
        header_bytes = cbrrr.encode_dag_cbor({"version": 1, "roots": [root]})
        stream.write(encode_varint(len(header_bytes)))
        stream.write(header_bytes)

    def write_block(self, cid: cbrrr.CID, value: bytes):
        cid_bytes = bytes(cid)
        self.stream.write(encode_varint(len(cid_bytes) + len(value)))
        self.stream.write(cid_bytes)
        self.stream.write(value)


keys = []
key_heights = [
    0,
    1,
    0,
    2,
    0,
    1,
    0,
]  # if all these keys are added to a MST, it'll form a perfect binary tree.
i = 0
for height in key_heights:
    while True:
        key = f"k/{i:02d}"
        i += 1
        if MSTNode.key_height(key) == height:
            keys.append(key)
            break

vals = [
    CID.cidv1_dag_cbor_sha256_32_from(
        cbrrr.encode_dag_cbor({"$type": "mst-test-data", "value_for": k})
    )
    for k in keys
]

val_for_key = dict(zip(keys, vals))

print(keys)
print(vals)

# we can reuse these
bs = MemoryBlockStore()
ns = NodeStore(bs)
wrangler = NodeWrangler(ns)

roots = []

for i in range(2 ** len(keys)):
    filename = f"./cars/exhaustive/exhaustive_{i:03d}.car"
    root = ns.get_node(None).cid
    for j in range(len(keys)):
        if (i >> j) & 1:
            # filename += f"_{keys[j]}h{key_heights[j]}"
            root = wrangler.put_record(root, keys[j], vals[j])
    # filename += ".car"
    print(i, filename)

    car_blocks = []
    for node in NodeWalker(ns, root).iter_nodes():
        car_blocks.append((node.cid, node.serialised))

    assert len(set(cid for cid, val in car_blocks)) == len(car_blocks)  # no dupes

    with open(filename, "wb") as carfile:
        car = CarWriter(carfile, root)
        for cid, val in sorted(car_blocks, key=lambda x: bytes(x[0])):
            car.write_block(cid, val)

    roots.append(root)

# collecting these stats just for the sake of curiosity
# identical_proof_and_creation_count = 0
# proof_superset_of_creation_count = 0
# creation_superset_of_proof_count = 0
inversion_needs_extra_blocks = 0
clusion_proof_nodes_not_in_inversion_proof = 0

# generate exhaustive test cases
for ai, root_a in enumerate(roots):
    for bi, root_b in enumerate(roots):
        filename = f"./tests/diff/exhaustive/exhaustive_{ai:03d}_{bi:03d}.json"
        print(filename)
        car_a = f"./cars/exhaustive/exhaustive_{ai:03d}.car"
        car_b = f"./cars/exhaustive/exhaustive_{bi:03d}.car"
        created_nodes, deleted_nodes = very_slow_mst_diff(ns, root_a, root_b)
        record_ops = []
        proof_nodes = set()
        no_deletions = True
        for delta in record_diff(ns, created_nodes, deleted_nodes):
            record_ops.append(
                {
                    "rpath": delta.path,
                    "old_value": None
                    if delta.prior_value is None
                    else delta.prior_value.encode(),
                    "new_value": None
                    if delta.later_value is None
                    else delta.later_value.encode(),
                }
            )
            if delta.later_value is None:  # deletion
                proof_nodes.update(proof.build_exclusion_proof(ns, root_b, delta.path))
                no_deletions = False
            else:  # update or create
                proof_nodes.update(proof.build_inclusion_proof(ns, root_b, delta.path))

        if no_deletions:  # commits with no deletions are more well-behaved
            assert proof_nodes.issubset(created_nodes)

        # my inductive-proof-generation logic is ops order sensitive, so we do the sort beforehand
        # TODO: maybe "deletes first" or similar produces smaller proofs on average?
        record_ops.sort(key=lambda x: x["rpath"])

        # figure out which blocks are required for inductive proofs.
        # the idea here is that we use an overlay blockstore and log every "get" that has to fall thru to the lower layer.
        # those gets are therefore the blocks required for a stateless consumer to verify the proof.
        upper = MemoryBlockStore()
        lbs = LoggingBlockStoreWrapper(bs)
        lns = NodeStore(OverlayBlockStore(upper, lbs))
        lnw = NodeWrangler(lns)
        proof_root = root_b
        for op in record_ops[
            ::-1
        ]:  # while the order does not effect the final root CID, it does affect the set of CIDs that fall thru
            if op["old_value"] is None:
                proof_root = lnw.del_record(proof_root, op["rpath"])
            else:
                proof_root = lnw.put_record(
                    proof_root, op["rpath"], val_for_key[op["rpath"]]
                )
        assert proof_root == root_a  # we're back to where we started
        inductive_proof_nodes = set(CID(cid) for cid in lbs.gets)

        if inductive_proof_nodes - (created_nodes | proof_nodes):
            # print(delta)
            inversion_needs_extra_blocks += 1

        if proof_nodes - inductive_proof_nodes:
            clusion_proof_nodes_not_in_inversion_proof += 1

        # if proof_nodes == created_nodes:
        # identical_proof_and_creation_count += 1
        # if proof_nodes.issuperset(created_nodes):
        # proof_superset_of_creation_count += 1
        # if created_nodes.issuperset(proof_nodes):
        # creation_superset_of_proof_count += 1

        testcase = {
            "$type": "mst-diff",
            "description": f"procedurally generated MST diff test case between MST {ai} and {bi}",
            "inputs": {"mst_a": car_a, "mst_b": car_b},
            "results": {
                "created_nodes": sorted([cid.encode() for cid in created_nodes]),
                "deleted_nodes": sorted([cid.encode() for cid in deleted_nodes]),
                "record_ops": record_ops,  # these were sorted earlier
                "proof_nodes": sorted([cid.encode() for cid in proof_nodes]),
                "inductive_proof_nodes": sorted(
                    [cid.encode() for cid in inductive_proof_nodes]
                ),
                "firehose_cids": "TODO",
            },
        }
        with open(filename, "w") as jsonfile:
            json.dump(testcase, jsonfile, indent="\t")

# print("identical_proof_and_creation_count", identical_proof_and_creation_count / (len(roots)**2)) # 0.75
# print("proof_superset_of_creation_count", proof_superset_of_creation_count / (len(roots)**2)) # 0.84
# print("creation_superset_of_proof_count", creation_superset_of_proof_count / (len(roots)**2)) # 0.91
print(
    "inversion_needs_extra_blocks", inversion_needs_extra_blocks / (len(roots) ** 2)
)  # 0.04
print(clusion_proof_nodes_not_in_inversion_proof)
