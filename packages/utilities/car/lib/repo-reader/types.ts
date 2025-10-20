import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

import { type CarEntry } from '../car-reader/index.js';

export class RepoEntry {
	/** @internal */
	constructor(
		/** the collection this record belongs to */
		public readonly collection: string,
		/** record key */
		public readonly rkey: string,
		/** CID of this record */
		public readonly cid: CID.CidLink,
		/** the associated CarEntry for this record */
		public readonly carEntry: CarEntry,
	) {}

	/**
	 * raw contents of this record
	 */
	get bytes(): Uint8Array {
		return this.carEntry.bytes;
	}

	/**
	 * decoded contents of this record
	 */
	get record(): unknown {
		return CBOR.decode(this.bytes);
	}
}
