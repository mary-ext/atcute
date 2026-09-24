import type { CarEntry } from '@atcute/car';
import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import type { PublicKey } from '@atcute/crypto';
import type { AtprotoDid } from '@atcute/lexicons/syntax';
import { isNodeData } from '@atcute/mst';

import { isCommit } from './types.ts';
import { assert } from './utils.ts';
import { CidMap, linkBytes } from './utils/cid-map.ts';
import { MAX_MST_DEPTH, MAX_NODE_ENTRIES, decodeMstKey } from './utils/mst.ts';

type BlockMap = CidMap<CarEntry>;

export interface VerifiedRecord {
	/** CID of the record */
	cid: string;
	/** decoded record data */
	record: unknown;
}

export interface VerifyRecordOptions {
	did?: AtprotoDid;
	collection: string;
	rkey: string;
	publicKey?: PublicKey;
	carBytes: Uint8Array;
}

/**
 * verifies that a record is committed at `collection/rkey` in a repository CAR, and returns it.
 *
 * the CAR may be a full repository export or a compact inclusion proof (as returned by
 * `com.atproto.sync.getRecord`). authenticity rests on three things: every block read is checked against its
 * CID, the commit is signed (when a public key is given), and the walk descends only by CIDs reachable from
 * the signed commit. it does not validate the overall tree shape (depth layering, sibling ordering) — that is
 * a separate, whole-repo concern and is not required to prove a single record's inclusion.
 *
 * @param options.did expected repository DID; rejected if the commit's DID differs
 * @param options.collection collection of the target record
 * @param options.rkey record key of the target record
 * @param options.publicKey signing key to verify the commit signature against; skipped if omitted
 * @param options.carBytes the CAR archive bytes
 * @returns the target record's CID and decoded data
 * @throws if the CAR is malformed, the DID or signature is invalid, or the record cannot be found
 * @throws {CAR.CarBlockMismatchError} if a block on the record's path does not match its CID
 */
export const verifyRecord = async ({
	did,
	collection,
	rkey,
	publicKey,
	carBytes,
}: VerifyRecordOptions): Promise<VerifiedRecord> => {
	// index blocks without hashing them; the descent verifies each block it actually reads, so an unrelated
	// bad block never costs work and partial proofs (with unlinked blocks omitted) are fine
	const reader = CAR.fromUint8Array(carBytes, { verifyBlocks: false });
	assert(reader.header.data.roots.length >= 1, `car must have at least one root`);

	const blockmap: BlockMap = new CidMap();
	let count = 0;
	for (const entry of reader) {
		blockmap.set(entry.cid.bytes, entry);
		count++;
	}

	assert(count >= 1, `car must have at least one block`);

	const root = reader.header.data.roots[0];
	const commitEntry = loadVerified(blockmap, root);
	assert(commitEntry !== undefined, `cid not found in blockmap; cid=${root.$link}`);

	const commit = CBOR.decode(commitEntry.bytes);
	assert(isCommit(commit), `expected commit block`);

	if (did !== undefined) {
		assert(commit.did === did, `did in commit does not match expected did`);
	}

	if (publicKey) {
		const { sig, ...unsigned } = commit;

		const data = CBOR.encode(unsigned);
		const valid = await publicKey.verify(
			CBOR.fromBytes(sig) as Uint8Array<ArrayBuffer>,
			data as Uint8Array<ArrayBuffer>,
		);

		assert(valid, `signature verification failed`);
	}

	const targetKey = `${collection}/${rkey}`;
	const found = descend(blockmap, commit.data, targetKey);
	assert(found !== null, `could not find record in car`);

	return found;
};

/**
 * looks up a block and verifies that its bytes hash to its CID
 *
 * @param blockmap CAR entries keyed by CID
 * @param link the CID link to read
 * @returns the verified entry, or undefined if the block is absent
 * @throws {CAR.CarBlockMismatchError} if the block's bytes do not match its CID
 * @internal
 */
const loadVerified = (blockmap: BlockMap, link: CidLink): CarEntry | undefined => {
	const entry = blockmap.get(linkBytes(link));
	if (entry !== undefined) {
		CAR.verifyBlock(entry.cid, entry.bytes);
	}

	return entry;
};

/**
 * descends an MST toward a target key, following only the sub-tree whose key range can contain it
 *
 * @param blockmap CAR entries keyed by CID
 * @param pointer a CID link to the current MST node
 * @param targetKey the full repo path being located
 * @param depth current traversal depth, used to bound recursion
 * @returns the record if found, or null if it is not present on the descended path
 * @internal
 */
const descend = (
	blockmap: BlockMap,
	pointer: CidLink,
	targetKey: string,
	depth: number = 0,
): VerifiedRecord | null => {
	assert(depth <= MAX_MST_DEPTH, `mst is too deep; depth=${depth}`);

	const block = loadVerified(blockmap, pointer);
	if (block === undefined) {
		// a node on the path is absent (e.g. a proof that does not cover this key)
		return null;
	}

	const node = CBOR.decode(block.bytes);
	assert(isNodeData(node), `invalid mst node; cid=${pointer.$link}`);

	const entries = node.e;
	assert(entries.length <= MAX_NODE_ENTRIES, `mst node has too many entries; count=${entries.length}`);

	// scan entries in key order; `subtree` tracks the sub-tree holding keys just before the current entry. the
	// target either matches an entry exactly, or falls into the one sub-tree whose range covers it
	let lastKey = '';
	let subtree: CidLink | null = node.l;

	for (let i = 0, il = entries.length; i < il; i++) {
		const entry = entries[i];
		const key = decodeMstKey(lastKey, entry);
		lastKey = key;

		if (key === targetKey) {
			return loadRecord(blockmap, entry.v);
		}

		if (key > targetKey) {
			break;
		}

		subtree = entry.t;
	}

	return subtree !== null ? descend(blockmap, subtree, targetKey, depth + 1) : null;
};

/**
 * reads and verifies a record block
 *
 * @param blockmap CAR entries keyed by CID
 * @param pointer a CID link to the record block
 * @returns the record if present, or null if its block is absent
 * @internal
 */
const loadRecord = (blockmap: BlockMap, pointer: CidLink): VerifiedRecord | null => {
	const block = loadVerified(blockmap, pointer);
	if (block === undefined) {
		return null;
	}

	return { cid: pointer.$link, record: CBOR.decode(block.bytes) };
};
