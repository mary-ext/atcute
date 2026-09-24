import type { CarEntry } from '@atcute/car';
import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import { type CidLink, toLinkBytes } from '@atcute/cid';
import { isNodeData } from '@atcute/mst';

import { RepoEntry, type RepoReaderOptions, isCommit } from './types.ts';
import { assert } from './utils.ts';
import { CidMap } from './utils/cid-map.ts';
import { MAX_MST_DEPTH, MAX_NODE_ENTRIES, decodeMstKey, parseMstKey } from './utils/mst.ts';

/** @internal */
type EntryMap = CidMap<CarEntry>;

/** node entry object */
interface NodeEntry {
	key: string;
	cid: CidLink;
}

/**
 * reads the records of a repository CAR from a buffer
 *
 * @param buf the CAR archive bytes
 * @param options reader options
 * @returns a generator yielding every record reachable from the root commit
 * @throws if the archive or repository structure is malformed, or {@link CAR.CarBlockMismatchError} if a
 *   block's bytes do not match its CID
 */
export function* fromUint8Array(buf: Uint8Array, options?: RepoReaderOptions): Generator<RepoEntry> {
	const car = CAR.fromUint8Array(buf, options);
	const roots = car.roots;

	assert(roots.length >= 1, `expected at least 1 root in the car archive; got=${roots.length}`);

	const map: EntryMap = new CidMap();
	let count = 0;
	for (const entry of car) {
		map.set(entry.cid.bytes, entry);
		count++;
	}

	// [commit, mst node, record?]
	assert(count >= 2, `expected at least 2 blocks in the archive; got=${count}`);

	const commit = readEntry(map, roots[0], isCommit);

	for (const { key, cid } of walkMstEntries(map, commit.data)) {
		const { collection, rkey } = parseMstKey(key);

		const carEntry = map.get(toLinkBytes(cid));
		if (carEntry === undefined) {
			throw new Error(`cid not found in blockmap; cid=${cid.$link}`);
		}

		yield new RepoEntry(collection, rkey, cid, carEntry);
	}
}

/**
 * reads a block from the blockmap and validates it against the provided validation function
 *
 * @param map CAR entries keyed by CID
 * @param link a CID link to read
 * @param validate a validation function to validate the decoded data
 * @returns the decoded and validated data
 * @internal
 */
export const readEntry = <T>(map: EntryMap, link: CidLink, validate: (value: unknown) => value is T): T => {
	// defer CID string encoding until an error occurs
	const entry = map.get(toLinkBytes(link));
	if (entry === undefined) {
		throw new Error(`cid not found in blockmap; cid=${link.$link}`);
	}

	const data = CBOR.decode(entry.bytes);
	if (!validate(data)) {
		throw new Error(`validation failed for cid=${link.$link}`);
	}

	return data;
};

/**
 * walks the entries of a Merkle Sorted Tree (MST) in a depth-first manner
 *
 * @param map CAR entries keyed by CID
 * @param pointer a CID link to the root of the MST
 * @param depth current traversal depth, used to bound recursion
 * @returns a generator that yields the entries of the MST
 * @internal
 */
export function* walkMstEntries(map: EntryMap, pointer: CidLink, depth: number = 0): Generator<NodeEntry> {
	if (depth > MAX_MST_DEPTH) {
		throw new Error(`mst is too deep; depth=${depth}`);
	}

	const data = readEntry(map, pointer, isNodeData);
	const entries = data.e;

	if (entries.length > MAX_NODE_ENTRIES) {
		throw new Error(`mst node has too many entries; count=${entries.length}`);
	}

	let lastKey = '';

	if (data.l !== null) {
		yield* walkMstEntries(map, data.l, depth + 1);
	}

	for (let i = 0, il = entries.length; i < il; i++) {
		const entry = entries[i];

		const key = decodeMstKey(lastKey, entry);
		lastKey = key;

		yield { key: key, cid: entry.v };

		if (entry.t !== null) {
			yield* walkMstEntries(map, entry.t, depth + 1);
		}
	}
}
