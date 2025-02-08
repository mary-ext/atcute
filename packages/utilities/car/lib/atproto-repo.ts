import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

import { readCar } from './reader.js';

const decoder = new TextDecoder();

export class RepoEntry {
	constructor(
		public readonly collection: string,
		public readonly rkey: string,
		public readonly cid: CID.CidLink,
		private blockmap: BlockMap,
	) {}

	get bytes(): Uint8Array {
		const cid = this.cid.$link;

		const bytes = this.blockmap.get(cid);
		assert(bytes != null, `cid not found in blockmap; cid=${cid}`);

		return bytes;
	}

	get record(): unknown {
		return CBOR.decode(this.bytes);
	}
}

export function* iterateAtpRepo(buf: Uint8Array): Generator<RepoEntry> {
	const { roots, iterate } = readCar(buf);
	assert(roots.length === 1, `expected only 1 root in the car archive; got=${roots.length}`);

	// Collect all archive entries into a mapping of CID string -> actual bytes
	const blockmap: BlockMap = new Map();
	for (const entry of iterate()) {
		blockmap.set(CID.toString(entry.cid), entry.bytes);
	}

	// Read the head, then walk through the MST tree from there.
	const commit = readObject(blockmap, roots[0], isCommit);
	for (const { key, cid } of walkMstEntries(blockmap, commit.data)) {
		const [collection, rkey] = key.split('/');

		yield new RepoEntry(collection, rkey, cid, blockmap);
	}
}

function readObject<T>(map: BlockMap, link: CID.CidLink, validate: (value: unknown) => value is T): T {
	const cid = link.$link;

	const bytes = map.get(cid);
	assert(bytes != null, `cid not found in blockmap; cid=${cid}`);

	const data = CBOR.decode(bytes);
	assert(validate(data), `validation failed for cid=${cid}`);

	return data;
}

export function* walkMstEntries(map: BlockMap, pointer: CID.CidLink): Generator<NodeEntry> {
	const data = readObject(map, pointer, isMstNode);
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

export type BlockMap = Map<string, Uint8Array>;

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

export interface Commit {
	version: 3;
	did: string;
	data: CID.CidLink;
	rev: string;
	prev: CID.CidLink | null;
	sig: CBOR.Bytes;
}

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

export const isTreeEntry = (value: unknown): value is TreeEntry => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.p === 'number' && isBytes(obj.k) && isCidLink(obj.v) && (obj.t === null || isCidLink(obj.t))
	);
};

export interface MstNode {
	/** link to sub-tree Node on a lower level and with all keys sorting before keys at this node */
	l: CID.CidLink | null;
	/** ordered list of TreeEntry objects */
	e: TreeEntry[];
}

export const isMstNode = (value: unknown): value is MstNode => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.l === null || isCidLink(obj.l)) && Array.isArray(obj.e) && obj.e.every(isTreeEntry);
};

export interface NodeEntry {
	key: string;
	cid: CID.CidLink;
}
