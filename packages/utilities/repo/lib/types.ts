import type { CarEntry } from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import { type Bytes, isBytes } from '@atcute/cbor';
import { type CidLink, isCidLink } from '@atcute/cid';

export class RepoEntry {
	/** the collection this record belongs to */
	readonly collection: string;
	/** record key */
	readonly rkey: string;
	/** CID of this record */
	readonly cid: CidLink;
	/** the associated CarEntry for this record */
	readonly carEntry: CarEntry;

	/** @internal */
	constructor(collection: string, rkey: string, cid: CidLink, carEntry: CarEntry) {
		this.collection = collection;
		this.rkey = rkey;
		this.cid = cid;
		this.carEntry = carEntry;
	}

	/** raw contents of this record */
	get bytes(): Uint8Array {
		return this.carEntry.bytes;
	}

	/** decoded contents of this record */
	get record(): unknown {
		return CBOR.decode(this.bytes);
	}
}

/** commit object */
export interface Commit {
	version: 3;
	did: string;
	data: CidLink;
	rev: string;
	sig: Bytes;
	/** backwards compatibility with v2, history bookkeeping is not required */
	prev: CidLink | null;
}

/**
 * checks if value is a valid commit object
 *
 * @param value value to check
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
