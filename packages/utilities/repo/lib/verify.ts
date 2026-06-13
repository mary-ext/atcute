import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import type { PublicKey } from '@atcute/crypto';
import type { AtprotoDid } from '@atcute/lexicons/syntax';
import { type NodeData, isNodeData } from '@atcute/mst';
import { decodeUtf8From, encodeUtf8, toSha256 } from '@atcute/uint8array';

import { type Commit, isCommit } from './types.ts';
import { MAX_MST_DEPTH, MAX_NODE_ENTRIES } from './utils/mst.ts';

type BlockMap = Map<string, Uint8Array>;

export interface VerifiedRecord {
	/** CID of the record */
	cid: string;
	/** Record data */
	record: unknown;
}

export interface VerifyRecordOptions {
	did?: AtprotoDid;
	collection: string;
	rkey: string;
	publicKey?: PublicKey;
	carBytes: Uint8Array;
}

export const verifyRecord = async ({
	did,
	collection,
	rkey,
	publicKey,
	carBytes,
}: VerifyRecordOptions): Promise<VerifiedRecord> => {
	// read the car
	let blockmap: BlockMap;
	let commit: Commit;
	{
		const reader = CAR.fromUint8Array(carBytes);
		if (reader.header.data.roots.length < 1) {
			throw new Error(`car must have at least one root`);
		}

		blockmap = new Map();
		for (const entry of reader) {
			const cidString = CID.toString(entry.cid);

			// Verify that `bytes` matches its associated CID
			const expectedCid = CID.toString(await CID.create(entry.cid.codec as 85 | 113, entry.bytes));
			if (cidString !== expectedCid) {
				throw new Error(`cid does not match bytes`);
			}

			blockmap.set(cidString, entry.bytes);
		}

		if (blockmap.size === 0) {
			throw new Error(`car must have at least one block`);
		}

		commit = readBlock(blockmap, reader.header.data.roots[0].$link, isCommit);
	}

	// verify did in commit matches the did
	if (did !== undefined && commit.did !== did) {
		throw new Error(`did in commit does not match expected did`);
	}

	// verify signature contained in commit is valid (if publicKey provided)
	if (publicKey) {
		const { sig, ...unsigned } = commit;

		const data = CBOR.encode(unsigned);
		const valid = await publicKey.verify(
			CBOR.fromBytes(sig) as Uint8Array<ArrayBuffer>,
			data as Uint8Array<ArrayBuffer>,
		);

		if (!valid) {
			throw new Error(`signature verification failed`);
		}
	}

	// find and verify the record in the commit
	const targetKey = `${collection}/${rkey}`;
	const { found } = await dfs(blockmap, commit.data.$link, targetKey);
	if (!found) {
		throw new Error(`could not find record in car`);
	}

	return {
		cid: found.cid,
		record: found.record,
	};
};

const readBlock = <T>(blockmap: BlockMap, cid: string, validate: (value: unknown) => value is T): T => {
	const bytes = blockmap.get(cid);
	if (!bytes) {
		throw new Error(`cid not found in blockmap; cid=${cid}`);
	}

	const decoded = CBOR.decode(bytes);
	if (!validate(decoded)) {
		throw new Error(`validation failed for cid=${cid}`);
	}

	return decoded;
};

interface DfsResult {
	found: false | { cid: string; record: unknown };
	min?: string;
	max?: string;
	depth?: number;
}

const dfs = async (
	blockmap: BlockMap,
	from: string | undefined,
	targetKey: string,
	visited = new Set<string>(),
	recursionDepth = 0,
): Promise<DfsResult> => {
	// If there's no starting point, return empty state
	if (from == null) {
		return { found: false };
	}

	if (recursionDepth > MAX_MST_DEPTH) {
		throw new Error(`mst is too deep; depth=${recursionDepth}`);
	}

	// Check for cycles
	{
		if (visited.has(from)) {
			throw new Error(`cycle detected; cid=${from}`);
		}

		visited.add(from);
	}

	// Get the block data
	let node: NodeData;
	{
		const bytes = blockmap.get(from);
		if (!bytes) {
			return { found: false };
		}

		const decoded = CBOR.decode(bytes);
		if (!isNodeData(decoded)) {
			throw new Error(`invalid mst node; cid=${from}`);
		}

		node = decoded;
	}

	if (node.e.length > MAX_NODE_ENTRIES) {
		throw new Error(`mst node has too many entries; count=${node.e.length}`);
	}

	// Recursively process the left child
	const left = await dfs(blockmap, node.l?.$link, targetKey, visited, recursionDepth + 1);

	let key = '';
	let found = left.found;
	let depth: number | undefined;
	let firstKey: string | undefined;
	let lastKey: string | undefined;

	// Process all entries in this node
	for (const entry of node.e) {
		// Construct the key by truncating and appending
		key = key.substring(0, entry.p) + decodeUtf8From(CBOR.fromBytes(entry.k));

		// Check if this is our target key
		if (key === targetKey) {
			const recordBytes = blockmap.get(entry.v.$link);
			if (recordBytes) {
				const record = CBOR.decode(recordBytes);
				found = { cid: entry.v.$link, record };
			}
		}

		// Calculate depth based on leading zeros in the hash
		const keyDigest = await toSha256(encodeUtf8(key));
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
		const right = await dfs(blockmap, entry.t?.$link, targetKey, visited, recursionDepth + 1);

		// Check ordering with right subtree
		if (right.min && right.min < lastKey) {
			throw new Error(`entries are out of order; cid=${from}`);
		}

		found = found || right.found;

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
