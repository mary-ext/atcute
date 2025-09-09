import * as CAR from '@atcute/car';
import { CarReader } from '@atcute/car/v4';
import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { type FoundPublicKey, getPublicKeyFromDidController, verifySig } from '@atcute/crypto';
import { type DidDocument, getAtprotoVerificationMaterial } from '@atcute/identity';
import { type AtprotoDid } from '@atcute/lexicons/syntax';
import { toSha256 } from '@atcute/uint8array';

export interface VerifyLexiconRecordOptions {
	did: AtprotoDid;
	cid: string;
	record: unknown;
	didDocument: DidDocument;
	carBytes: Uint8Array;
}

export const verifyLexiconRecord = async ({
	did,
	cid,
	record,
	didDocument,
	carBytes,
}: VerifyLexiconRecordOptions): Promise<void> => {
	// verify cid can be parsed
	try {
		CID.fromString(cid);
	} catch (cause) {
		throw new Error(`cid is invalid`, { cause });
	}

	// verify record content matches cid
	let cbor: Uint8Array;
	{
		cbor = CBOR.encode(record);

		const actual = CID.toString(await CID.create(CID.CODEC_DCBOR, cbor));
		if (actual !== cid) {
			console.log(record);
			throw new Error(`record content does not match cid`);
		}
	}

	// grab public key from did document
	let publicKey: FoundPublicKey;
	{
		const controller = getAtprotoVerificationMaterial(didDocument);
		if (!controller) {
			throw new Error(`did document does not contain verification material`);
		}

		publicKey = getPublicKeyFromDidController(controller);
	}

	// read the car
	let blockmap: CAR.BlockMap;
	let commit: CAR.Commit;
	{
		const reader = CarReader.fromUint8Array(carBytes);
		if (reader.header.data.roots.length !== 1) {
			throw new Error(`car must have exactly one root`);
		}

		blockmap = new Map();
		for (const entry of reader) {
			const cidString = CID.toString(entry.cid);

			// Verify that `bytes` matches its associated CID
			const expectedCid = CID.toString(await CID.create(entry.cid.codec as 85 | 113, entry.bytes));
			if (cidString !== expectedCid) {
				throw new Error(`cid does not match bytes`);
			}

			blockmap.set(cidString, entry);
		}

		if (blockmap.size === 0) {
			throw new Error(`car must have at least one block`);
		}

		commit = CAR.readBlock(blockmap, reader.header.data.roots[0], CAR.isCommit);
	}

	// verify did in commit matches the did
	if (commit.did !== did) {
		throw new Error(`did in commit does not match expected did`);
	}

	// verify signature contained in commit is valid
	{
		const { sig, ...unsigned } = commit;

		const data = CBOR.encode(unsigned);
		const valid = await verifySig(
			publicKey!,
			CBOR.fromBytes(sig) as Uint8Array<ArrayBuffer>,
			data as Uint8Array<ArrayBuffer>,
		);

		if (!valid) {
			throw new Error(`signature verification failed`);
		}
	}

	// verify the commit is a valid commit
	{
		const result = await dfs(blockmap, commit.data.$link, cid);
		if (!result.found) {
			throw new Error(`could not find record in car`);
		}
	}
};

interface DfsResult {
	found: boolean;
	min?: string;
	max?: string;
	depth?: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const dfs = async (
	blockmap: CAR.BlockMap,
	from: string | undefined,
	target: string,
	visited = new Set<string>(),
): Promise<DfsResult> => {
	// If there's no starting point, return empty state
	if (from == null) {
		return { found: false };
	}

	// Check for cycles
	{
		if (visited.has(from)) {
			throw new Error(`cycle detected; cid=${from}`);
		}

		visited.add(from);
	}

	// Get the block data
	let node: CAR.MstNode;
	{
		const entry = blockmap.get(from);
		if (!entry) {
			return { found: false };
		}

		const decoded = CBOR.decode(entry.bytes);
		if (!CAR.isMstNode(decoded)) {
			throw new Error(`invalid mst node; cid=${from}`);
		}

		node = decoded;
	}

	// Recursively process the left child
	const left = await dfs(blockmap, node.l?.$link, target, visited);

	let key = '';
	let found = left.found;
	let depth: number | undefined;
	let firstKey: string | undefined;
	let lastKey: string | undefined;

	// Process all entries in this node
	for (const entry of node.e) {
		if (entry.v.$link === target) {
			found = true;
		}

		// Construct the key by truncating and appending
		key = key.substring(0, entry.p) + decoder.decode(CBOR.fromBytes(entry.k));

		// Calculate depth based on leading zeros in the hash
		const keyDigest = await toSha256(encoder.encode(key) as Uint8Array<ArrayBuffer>);
		let zeroCount = 0;

		outerLoop: for (const byte of keyDigest) {
			for (let bit = 7; bit >= 0; bit--) {
				if (((byte >> bit) & 1) !== 0) {
					break outerLoop;
				}
				zeroCount++;
			}
		}

		const thisDepth = Math.floor(zeroCount / 2);

		// Ensure consistent depth
		if (depth === undefined) {
			depth = thisDepth;
		} else if (depth !== thisDepth) {
			throw new Error(`node has entries with different depths; cid=${from}`);
		}

		// Track first and last keys
		if (lastKey === undefined) {
			firstKey = key;
			lastKey = key;
		}

		// Check key ordering
		if (lastKey > key) {
			throw new Error(`entries are out of order; cid=${from}`);
		}

		// Process right child
		const right = await dfs(blockmap, entry.t?.$link, target, visited);

		// Check ordering with right subtree
		if (right.min && right.min < lastKey) {
			throw new Error(`entries are out of order; cid=${from}`);
		}

		found ||= right.found;

		// Check depth ordering
		if (left.depth !== undefined && left.depth >= thisDepth) {
			throw new Error(`depths are out of order; cid=${from}`);
		}

		if (right.depth !== undefined && right.depth >= thisDepth) {
			throw new Error(`depths are out of order; cid=${from}`);
		}

		// Update last key based on right subtree
		lastKey = right.max ?? key;
	}

	// Check ordering with left subtree
	if (left.max && firstKey && left.max > firstKey) {
		throw new Error(`entries are out of order; cid=${from}`);
	}

	return {
		found,
		min: firstKey,
		max: lastKey,
		depth,
	};
};
