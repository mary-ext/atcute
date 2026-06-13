import type { CarEntry } from '@atcute/car';
import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';
import { isNodeData } from '@atcute/mst';

import { RepoEntry, isCommit } from './types.ts';
import { assert } from './utils.ts';
import { decodeMstKey, parseMstKey } from './utils/mst.ts';

/** @internal */
type EntryMap = Map<string, CarEntry>;

/** node entry object */
interface NodeEntry {
	key: string;
	cid: CidLink;
}

export function* fromUint8Array(buf: Uint8Array): Generator<RepoEntry> {
	const car = CAR.fromUint8Array(buf);
	const roots = car.roots;

	assert(roots.length >= 1, `expected at least 1 root in the car archive; got=${roots.length}`);

	const map: EntryMap = new Map();
	for (const entry of car) {
		map.set(CID.toString(entry.cid), entry);
	}

	// [commit, mst node, record?]
	assert(map.size >= 2, `expected at least 2 blocks in the archive; got=${map.size}`);

	const commit = readEntry(map, roots[0], isCommit);

	for (const { key, cid } of walkMstEntries(map, commit.data)) {
		const { collection, rkey } = parseMstKey(key);

		const carEntry = map.get(cid.$link);
		assert(carEntry != null, `cid not found in blockmap; cid=${cid}`);

		yield new RepoEntry(collection, rkey, cid, carEntry);
	}
}

/**
 * reads a block from the blockmap and validates it against the provided validation function
 *
 * @param map a mapping of CID string -> actual bytes
 * @param link a CID link to read
 * @param validate a validation function to validate the decoded data
 * @returns the decoded and validated data
 * @internal
 */
export const readEntry = <T>(map: EntryMap, link: CidLink, validate: (value: unknown) => value is T): T => {
	const cid = link.$link;

	const entry = map.get(cid);
	assert(entry != null, `cid not found in blockmap; cid=${cid}`);

	const data = CBOR.decode(entry.bytes);
	assert(validate(data), `validation failed for cid=${cid}`);

	return data;
};

/**
 * walks the entries of a Merkle Sorted Tree (MST) in a depth-first manner
 *
 * @param map a mapping of CID string -> actual bytes
 * @param pointer a CID link to the root of the MST
 * @returns a generator that yields the entries of the MST
 * @internal
 */
export function* walkMstEntries(map: EntryMap, pointer: CidLink): Generator<NodeEntry> {
	const data = readEntry(map, pointer, isNodeData);
	const entries = data.e;

	let lastKey = '';

	if (data.l !== null) {
		yield* walkMstEntries(map, data.l);
	}

	for (let i = 0, il = entries.length; i < il; i++) {
		const entry = entries[i];

		const key = decodeMstKey(lastKey, entry);
		lastKey = key;

		yield { key: key, cid: entry.v };

		if (entry.t !== null) {
			yield* walkMstEntries(map, entry.t);
		}
	}
}
