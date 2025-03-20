import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

import { readCar, type CarEntry } from './reader.js';

const decoder = new TextDecoder();

export type BlockMap = Map<string, CarEntry>;

export class RepoEntry {
	constructor(
		/** The collection this record belongs to */
		public readonly collection: string,
		/** Record key */
		public readonly rkey: string,
		/** CID of this record */
		public readonly cid: CID.CidLink,
		private blockmap: BlockMap,
	) {}

	/**
	 * returns the associated CarEntry for this record
	 */
	get carEntry(): CarEntry {
		const cid = this.cid.$link;

		const entry = this.blockmap.get(cid);
		assert(entry != null, `cid not found in blockmap; cid=${cid}`);

		return entry;
	}

	/**
	 * returns the raw contents of this record
	 */
	get bytes(): Uint8Array {
		return this.carEntry.bytes;
	}

	/**
	 * returns the decoded contents of this record
	 */
	get record(): unknown {
		return CBOR.decode(this.bytes);
	}
}

export function* iterateAtpRepo(buf: Uint8Array): Generator<RepoEntry> {
	const { header, iterate } = readCar(buf);
	const roots = header.data.roots;

	assert(roots.length === 1, `expected only 1 root in the car archive; got=${roots.length}`);

	const blockmap = collectBlock(iterate());
	assert(blockmap.size > 0, `expected at least 1 block in the archive; got=${blockmap.size}`);

	const commit = readBlock(blockmap, roots[0], isCommit);
	for (const { key, cid } of walkMstEntries(blockmap, commit.data)) {
		const [collection, rkey] = key.split('/');

		yield new RepoEntry(collection, rkey, cid, blockmap);
	}
}

/**
 * collects entries from a CAR archive into a mapping of CID string -> actual bytes
 * @param iterator a generator that yields objects with a `cid` and `bytes` property
 * @returns a mapping of CID string -> actual bytes
 */
export function collectBlock(iterator: Generator<CarEntry>): BlockMap {
	const blockmap: BlockMap = new Map();
	for (const entry of iterator) {
		blockmap.set(CID.toString(entry.cid), entry);
	}

	return blockmap;
}

/**
 * reads a block from the blockmap and validates it against the provided validation function
 * @param map a mapping of CID string -> actual bytes
 * @param link a CID link to read
 * @param validate a validation function to validate the decoded data
 * @returns the decoded and validated data
 */
export function readBlock<T>(map: BlockMap, link: CID.CidLink, validate: (value: unknown) => value is T): T {
	const cid = link.$link;

	const entry = map.get(cid);
	assert(entry != null, `cid not found in blockmap; cid=${cid}`);

	const data = CBOR.decode(entry.bytes);
	assert(validate(data), `validation failed for cid=${cid}`);

	return data;
}

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

		const key_str = decoder.decode(CBOR.fromBytes(entry.k));
		const key = lastKey.slice(0, entry.p) + key_str;

		lastKey = key;

		yield { key: key, cid: entry.v };

		if (entry.t !== null) {
			yield* walkMstEntries(map, entry.t);
		}
	}
}

function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

const isCidLink = (value: unknown): value is CID.CidLink => {
	if (value instanceof CID.CidLinkWrapper) {
		return true;
	}

	if (value === null || typeof value !== 'object') {
		return false;
	}

	return '$link' in value && typeof value.$link === 'string';
};

const isBytes = (value: unknown): value is CBOR.Bytes => {
	if (value instanceof CBOR.BytesWrapper) {
		return true;
	}

	if (value === null || typeof value !== 'object') {
		return false;
	}

	return '$bytes' in value && typeof value.$bytes === 'string';
};

/** commit object */
export interface Commit {
	version: 3;
	did: string;
	data: CID.CidLink;
	rev: string;
	prev: CID.CidLink | null;
	sig: CBOR.Bytes;
}

/**
 * checks if a value is a valid commit object
 * @param value the value to check
 * @returns true if the value is a valid commit object, false otherwise
 */
export const isCommit = (value: unknown): value is Commit => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		obj.version === 3 &&
		typeof obj.did === 'string' &&
		isCidLink(obj.data) &&
		typeof obj.rev === 'string' &&
		(obj.prev === null || isCidLink(obj.prev)) &&
		isBytes(obj.sig)
	);
};

/** mst tree entry object */
export interface TreeEntry {
	/** count of bytes shared with previous TreeEntry in this Node (if any) */
	p: number;
	/** remainder of key for this TreeEntry, after "prefixlen" have been removed */
	k: CBOR.Bytes;
	/** link to a sub-tree Node at a lower level which has keys sorting after this TreeEntry's key (to the "right"), but before the next TreeEntry's key in this Node (if any) */
	v: CID.CidLink;
	/** next subtree (to the right of leaf) */
	t: CID.CidLink | null;
}

/**
 * checks if a value is a valid mst tree entry object
 * @param value the value to check
 * @returns true if the value is a valid mst tree entry object, false otherwise
 */
export const isTreeEntry = (value: unknown): value is TreeEntry => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.p === 'number' && isBytes(obj.k) && isCidLink(obj.v) && (obj.t === null || isCidLink(obj.t))
	);
};

/** mst node object */
export interface MstNode {
	/** link to sub-tree Node on a lower level and with all keys sorting before keys at this node */
	l: CID.CidLink | null;
	/** ordered list of TreeEntry objects */
	e: TreeEntry[];
}

/**
 * checks if a value is a valid mst node object
 * @param value the value to check
 * @returns true if the value is a valid mst node object, false otherwise
 */
export const isMstNode = (value: unknown): value is MstNode => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.l === null || isCidLink(obj.l)) && Array.isArray(obj.e) && obj.e.every(isTreeEntry);
};
