import * as CBOR from '@atcute/cbor';
import { type TreeEntry, isMstKey } from '@atcute/mst';
import { decodeUtf8From } from '@atcute/uint8array';

import { assert } from '../utils.ts';

/**
 * maximum MST traversal depth before a tree is rejected. repositories are reproducible from their contents,
 * so legitimate trees are shallow (well under this); the cap exists to bound recursion and prevent stack
 * overflow from a hostile CAR chaining nodes arbitrarily deep.
 */
export const MAX_MST_DEPTH = 256;

/**
 * maximum number of entries in a single MST node. bounds per-node work against key-mining attacks that pack
 * many entries into one node to amplify storage and processing cost.
 */
export const MAX_NODE_ENTRIES = 8192;

export const parseMstKey = (key: string): { collection: string; rkey: string } => {
	assert(isMstKey(key), `invalid repo path; key=${key}`);

	const slash = key.indexOf('/');
	return { collection: key.slice(0, slash), rkey: key.slice(slash + 1) };
};

/**
 * reconstructs and validates an MST key from its prefix-compressed tree entry. the prefix length must be in
 * range, the prefix compaction must be maximal (deterministic), and keys must be strictly increasing within a
 * node.
 *
 * @param prevKey the previous entry's key in the same node (empty string for the first entry)
 * @param entry the tree entry to decode
 * @returns the full key for this entry
 * @throws if the entry's prefix length, prefix compaction, or sort order is invalid
 * @internal
 */
export const decodeMstKey = (prevKey: string, entry: TreeEntry): string => {
	const prefixLen = entry.p;
	assert(
		Number.isInteger(prefixLen) && prefixLen >= 0 && prefixLen <= prevKey.length,
		`invalid mst node; key prefix length out of range; p=${prefixLen}`,
	);

	const suffix = decodeUtf8From(CBOR.fromBytes(entry.k));
	assert(prevKey[prefixLen] !== suffix[0], `invalid mst node; suboptimal key prefix length`);

	const key = prevKey.slice(0, prefixLen) + suffix;
	assert(key > prevKey, `invalid mst node; keys are out of order`);

	return key;
};
