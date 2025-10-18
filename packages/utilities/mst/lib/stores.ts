import * as CBOR from '@atcute/cbor';

import { deleteMany, setMany, type BlockMap } from './blockmap.js';
import { MissingBlockError, UnexpectedObjectError } from './errors.js';

export interface ReadonlyBlockStore {
	get(cid: string): Promise<Uint8Array<ArrayBuffer> | null>;
	getMany(cids: string[]): Promise<{ found: BlockMap; missing: string[] }>;

	has(cid: string): Promise<boolean>;
}

export interface BlockStore extends ReadonlyBlockStore {
	put(cid: string, bytes: Uint8Array<ArrayBuffer>): Promise<void>;
	putMany(blocks: BlockMap): Promise<void>;

	delete(cid: string): Promise<void>;
	deleteMany(cids: string[]): Promise<void>;
}

export class ReadonlyMemoryBlockStore implements ReadonlyBlockStore {
	blocks: BlockMap = new Map();

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

export class OverlayBlockStore implements BlockStore {
	upper: BlockStore;
	lower: ReadonlyBlockStore;

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

export const readRecord = async (store: ReadonlyBlockStore, cid: string): Promise<unknown> => {
	const bytes = await store.get(cid);
	if (bytes === null) {
		throw new MissingBlockError(cid, undefined);
	}

	const decoded = CBOR.decode(bytes);

	return decoded;
};

interface CheckDef<T> {
	name: string;
	check: (value: unknown) => value is T;
}
