import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

import { readCar } from './reader.js';

const decoder = new TextDecoder();

export class RepoEntry {
	constructor(
		public readonly collection: string,
		public readonly rkey: string,
		public readonly cid: CBOR.CIDLink,
		private blockmap: BlockMap,
	) {}

	get record(): unknown {
		return readObject(this.blockmap, this.cid);
	}
}

export function* iterateAtpRepo(buf: Uint8Array): Generator<RepoEntry> {
	const { roots, iterate } = readCar(new Uint8Array(buf));
	assert(roots.length === 1, `expected only 1 root in the car archive; got=${roots.length}`);

	// Collect all archive entries into a mapping of CID string -> actual bytes
	const blockmap: BlockMap = new Map();
	for (const entry of iterate()) {
		blockmap.set(CID.format(entry.cid), entry.bytes);
	}

	// Read the head, then walk through the MST tree from there.
	const commit = readObject(blockmap, roots[0]) as Commit;
	for (const { key, cid } of walkEntries(blockmap, commit.data)) {
		const [collection, rkey] = key.split('/');

		yield new RepoEntry(collection, rkey, cid, blockmap);
	}
}

/** @deprecated Use `iterateAtpRepo` instead */
export const iterateAtpCar = iterateAtpRepo;

function readObject(map: BlockMap, link: CBOR.CIDLink): unknown {
	const cid = link.$link;

	const bytes = map.get(cid);
	assert(bytes != null, `cid not found in blockmap; cid=${cid}`);

	const data = CBOR.decode(bytes);

	return data;
}

function* walkEntries(map: BlockMap, pointer: CBOR.CIDLink): Generator<NodeEntry> {
	const data = readObject(map, pointer) as MstNode;
	const entries = data.e;

	let lastKey = '';

	if (data.l !== null) {
		yield* walkEntries(map, data.l);
	}

	for (let i = 0, il = entries.length; i < il; i++) {
		const entry = entries[i];

		const key_str = decoder.decode(CBOR.fromBytes(entry.k));
		const key = lastKey.slice(0, entry.p) + key_str;

		lastKey = key;

		yield { key: key, cid: entry.v };

		if (entry.t !== null) {
			yield* walkEntries(map, entry.t);
		}
	}
}

function assert(condition: boolean, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

type BlockMap = Map<string, Uint8Array>;

interface Commit {
	version: 3;
	did: string;
	data: CBOR.CIDLink;
	rev: string;
	prev: CBOR.CIDLink | null;
	sig: CBOR.Bytes;
}

interface TreeEntry {
	/** count of bytes shared with previous TreeEntry in this Node (if any) */
	p: number;
	/** remainder of key for this TreeEntry, after "prefixlen" have been removed */
	k: CBOR.Bytes;
	/** link to a sub-tree Node at a lower level which has keys sorting after this TreeEntry's key (to the "right"), but before the next TreeEntry's key in this Node (if any) */
	v: CBOR.CIDLink;
	/** next subtree (to the right of leaf) */
	t: CBOR.CIDLink | null;
}

interface MstNode {
	/** link to sub-tree Node on a lower level and with all keys sorting before keys at this node */
	l: CBOR.CIDLink | null;
	/** ordered list of TreeEntry objects */
	e: TreeEntry[];
}

interface NodeEntry {
	key: string;
	cid: CBOR.CIDLink;
}
