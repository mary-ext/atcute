import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { decodeUtf8From } from '@atcute/uint8array';

import * as CarReader from '../car-reader/index.js';
import { assert } from '../utils.js';

import { isMstNode } from './mst.js';

export type BlockMap = Map<string, CarReader.CarEntry>;

/**
 * collects entries from a CAR archive into a mapping of CID string -> actual bytes
 * @param iterator a generator that yields objects with a `cid` and `bytes` property
 * @returns a mapping of CID string -> actual bytes
 */
export const collectBlock = (iterator: Iterable<CarReader.CarEntry>): BlockMap => {
	const blockmap: BlockMap = new Map();
	for (const entry of iterator) {
		blockmap.set(CID.toString(entry.cid), entry);
	}

	return blockmap;
};

/**
 * reads a block from the blockmap and validates it against the provided validation function
 * @param map a mapping of CID string -> actual bytes
 * @param link a CID link to read
 * @param validate a validation function to validate the decoded data
 * @returns the decoded and validated data
 */
export const readBlock = <T>(
	map: BlockMap,
	link: CID.CidLink,
	validate: (value: unknown) => value is T,
): T => {
	const cid = link.$link;

	const entry = map.get(cid);
	assert(entry != null, `cid not found in blockmap; cid=${cid}`);

	const data = CBOR.decode(entry.bytes);
	assert(validate(data), `validation failed for cid=${cid}`);

	return data;
};

/** node entry object */
export interface NodeEntry {
	key: string;
	cid: CID.CidLink;
}

/**
 * walks the entries of a Merkle Sorted Tree (MST) in a depth-first manner
 * @param map a mapping of CID string -> actual bytes
 * @param pointer a CID link to the root of the MST
 * @returns a generator that yields the entries of the MST
 */
export function* walkMstEntries(map: BlockMap, pointer: CID.CidLink): Generator<NodeEntry> {
	const data = readBlock(map, pointer, isMstNode);
	const entries = data.e;

	let lastKey = '';

	if (data.l !== null) {
		yield* walkMstEntries(map, data.l);
	}

	for (let i = 0, il = entries.length; i < il; i++) {
		const entry = entries[i];

		const key_str = decodeUtf8From(CBOR.fromBytes(entry.k));
		const key = lastKey.slice(0, entry.p) + key_str;

		lastKey = key;

		yield { key: key, cid: entry.v };

		if (entry.t !== null) {
			yield* walkMstEntries(map, entry.t);
		}
	}
}
