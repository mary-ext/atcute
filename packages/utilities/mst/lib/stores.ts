import * as CBOR from '@atcute/cbor';

import { deleteMany, setMany, type BlockMap } from './blockmap.js';
import { MissingBlockError, UnexpectedObjectError } from './errors.js';

/**
 * a read-only interface for retrieving blocks by their CID
 */
export interface ReadonlyBlockStore {
	/**
	 * retrieves a single block by its CID
	 * @param cid the CID of the block to retrieve
	 * @returns the block data, or null if not found
	 */
	get(cid: string): Promise<Uint8Array<ArrayBuffer> | null>;

	/**
	 * retrieves multiple blocks by their CIDs
	 * @param cids array of CIDs to retrieve
	 * @returns object containing found blocks and missing CIDs
	 */
	getMany(cids: string[]): Promise<{ found: BlockMap; missing: string[] }>;

	/**
	 * checks if a block exists in the store
	 * @param cid the CID to check
	 * @returns true if the block exists, false otherwise
	 */
	has(cid: string): Promise<boolean>;
}

/**
 * a writable block store supporting both read and write operations
 */
export interface BlockStore extends ReadonlyBlockStore {
	/**
	 * stores a single block
	 * @param cid the CID of the block
	 * @param bytes the block data to store
	 */
	put(cid: string, bytes: Uint8Array<ArrayBuffer>): Promise<void>;

	/**
	 * stores multiple blocks at once
	 * @param blocks map of CIDs to block data
	 */
	putMany(blocks: BlockMap): Promise<void>;

	/**
	 * removes a single block from the store
	 * @param cid the CID of the block to remove
	 */
	delete(cid: string): Promise<void>;

	/**
	 * removes multiple blocks from the store
	 * @param cids array of CIDs to remove
	 */
	deleteMany(cids: string[]): Promise<void>;
}

/**
 * an in-memory read-only block store using a Map
 */
export class ReadonlyMemoryBlockStore implements ReadonlyBlockStore {
	/** underlying map storing CID to block data */
	blocks: BlockMap = new Map();

	/**
	 * creates a new read-only memory block store
	 * @param blocks optional initial blocks to populate the store with
	 */
	constructor(blocks?: BlockMap) {
		if (blocks !== undefined) {
			setMany(this.blocks, blocks);
		}
	}

	get(cid: string): Promise<Uint8Array<ArrayBuffer> | null> {
		return Promise.resolve(this.blocks.get(cid) ?? null);
	}

	getMany(cids: string[]): Promise<{ found: BlockMap; missing: string[] }> {
		const found: BlockMap = new Map();
		const missing: string[] = [];

		for (const cid of cids) {
			const bytes = this.blocks.get(cid);
			if (bytes !== undefined) {
				found.set(cid, bytes);
			} else {
				missing.push(cid);
			}
		}

		return Promise.resolve({ found, missing });
	}

	has(cid: string): Promise<boolean> {
		return Promise.resolve(this.blocks.has(cid));
	}
}

/**
 * an in-memory writable block store using a Map
 */
export class MemoryBlockStore extends ReadonlyMemoryBlockStore implements BlockStore {
	put(cid: string, bytes: Uint8Array<ArrayBuffer>): Promise<void> {
		this.blocks.set(cid, bytes);
		return Promise.resolve();
	}

	putMany(blocks: BlockMap): Promise<void> {
		setMany(this.blocks, blocks);
		return Promise.resolve();
	}

	delete(cid: string): Promise<void> {
		this.blocks.delete(cid);
		return Promise.resolve();
	}

	deleteMany(cids: string[]): Promise<void> {
		deleteMany(this.blocks, cids);
		return Promise.resolve();
	}
}

/**
 * a block store that overlays one store on top of another
 * reads check upper first, then fall back to lower
 * all writes go to the upper store only
 */
export class OverlayBlockStore implements BlockStore {
	/** the writable upper layer store */
	upper: BlockStore;
	/** the read-only lower layer store */
	lower: ReadonlyBlockStore;

	/**
	 * creates a new overlay block store
	 * @param upper the writable upper layer store
	 * @param lower the read-only lower layer store
	 */
	constructor(upper: BlockStore, lower: ReadonlyBlockStore) {
		this.upper = upper;
		this.lower = lower;
	}

	async get(cid: string): Promise<Uint8Array<ArrayBuffer> | null> {
		let bytes = await this.upper.get(cid);
		if (bytes === null) {
			bytes = await this.lower.get(cid);
		}

		return bytes;
	}

	async getMany(cids: string[]): Promise<{ found: BlockMap; missing: string[] }> {
		const upper = await this.upper.getMany(cids);
		const lower = await this.lower.getMany(upper.missing);

		const found = upper.found;
		const missing = lower.missing;

		setMany(found, lower.found);

		return { found, missing };
	}

	async has(cid: string): Promise<boolean> {
		let exists = await this.upper.has(cid);
		if (!exists) {
			exists = await this.lower.has(cid);
		}

		return exists;
	}

	async put(cid: string, bytes: Uint8Array<ArrayBuffer>): Promise<void> {
		await this.upper.put(cid, bytes);
	}

	async putMany(blocks: BlockMap): Promise<void> {
		await this.upper.putMany(blocks);
	}

	async delete(cid: string): Promise<void> {
		await this.upper.delete(cid);
	}

	async deleteMany(cids: string[]): Promise<void> {
		return await this.upper.deleteMany(cids);
	}
}

/**
 * reads and decodes a block, validating it matches the expected type
 * @param store block store to read from
 * @param cid CID of the block to read
 * @param def schema definition with name and validation function
 * @returns the decoded and validated object
 * @throws {MissingBlockError} if block is not found
 * @throws {UnexpectedObjectError} if block doesn't match expected type
 */
export const readObject = async <T>(store: ReadonlyBlockStore, cid: string, def: CheckDef<T>): Promise<T> => {
	const bytes = await store.get(cid);
	if (bytes === null) {
		throw new MissingBlockError(cid, def.name);
	}

	const decoded = CBOR.decode(bytes);
	if (!def.check(decoded)) {
		throw new UnexpectedObjectError(cid, def.name);
	}

	return decoded;
};

/**
 * reads and decodes a block without type validation
 * @param store block store to read from
 * @param cid CID of the block to read
 * @returns the decoded object
 * @throws {MissingBlockError} if block is not found
 */
export const readRecord = async (store: ReadonlyBlockStore, cid: string): Promise<unknown> => {
	const bytes = await store.get(cid);
	if (bytes === null) {
		throw new MissingBlockError(cid, undefined);
	}

	const decoded = CBOR.decode(bytes);

	return decoded;
};

/**
 * defines a type validator for use with readObject
 * combines a human-readable type name with a type guard function
 */
export interface CheckDef<T> {
	/** human-readable name of the expected type */
	name: string;
	/** type guard function to validate the decoded value */
	check: (value: unknown) => value is T;
}
