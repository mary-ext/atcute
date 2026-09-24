import * as CID from '@atcute/cid';
import { encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { NodeStore } from './node-store.ts';
import { NodeWalker } from './node-walker.ts';
import { NodeWrangler } from './node-wrangler.ts';
import { MSTNode } from './node.ts';
import { MemoryBlockStore } from './stores.ts';
import { computeKeyHeight } from './utils/key-height.ts';

const createCid = async (data: string) => {
	const bytes = encodeUtf8(data);
	return CID.toCidLink(await CID.create(0x55, bytes));
};

/** finds the first key at `height` that sorts after `after` */
const findKey = (height: number, after = ''): string => {
	for (let i = 0; ; i++) {
		const key = `coll/${i.toString().padStart(4, '0')}`;
		if (key > after && computeKeyHeight(key) === height) {
			return key;
		}
	}
};

describe('NodeWrangler', () => {
	it('should put a record into an empty tree', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const emptyNode = MSTNode.empty();
		await store.put(emptyNode);
		const emptyCid = (await emptyNode.cid()).$link;

		const key = 'test/key';
		const value = await createCid('test-value');

		const newRootCid = await wrangler.putRecord(emptyCid, key, value);

		// verify the tree contains the new entry
		const walker = await NodeWalker.create(store, newRootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(1);
		expect(entries[0][0]).toBe(key);
		expect(entries[0][1].$link).toBe(value.$link);
	});

	it('should put a record into null (empty tree)', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const key = 'test/key';
		const value = await createCid('test-value');

		const newRootCid = await wrangler.putRecord(null, key, value);

		// verify the tree contains the new entry
		const walker = await NodeWalker.create(store, newRootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(1);
		expect(entries[0][0]).toBe(key);
		expect(entries[0][1].$link).toBe(value.$link);
	});

	it('should put multiple records', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;

		const keys = ['coll/a', 'coll/b', 'coll/c', 'coll/d'];
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// verify all entries are present
		const walker = await NodeWalker.create(store, rootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(keys.length);
		for (let i = 0; i < keys.length; i++) {
			expect(entries[i][0]).toBe(keys[i]);
			expect(entries[i][1].$link).toBe(values[i].$link);
		}
	});

	it('should be a no-op when putting the same value twice', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const key = 'test/key';
		const value = await createCid('test-value');

		const rootCid1 = await wrangler.putRecord(null, key, value);
		const rootCid2 = await wrangler.putRecord(rootCid1, key, value);

		// CIDs should be identical since nothing changed
		expect(rootCid1).toBe(rootCid2);
	});

	it('should update an existing key with a new value', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const key = 'test/key';
		const value1 = await createCid('value-1');
		const value2 = await createCid('value-2');

		const rootCid1 = await wrangler.putRecord(null, key, value1);
		const rootCid2 = await wrangler.putRecord(rootCid1, key, value2);

		// CIDs should be different
		expect(rootCid1).not.toBe(rootCid2);

		// verify the new value is present
		const walker = await NodeWalker.create(store, rootCid2);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(1);
		expect(entries[0][0]).toBe(key);
		expect(entries[0][1].$link).toBe(value2.$link);
	});

	it('should delete a record', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const key = 'test/key';
		const value = await createCid('test-value');

		const rootCid1 = await wrangler.putRecord(null, key, value);
		const rootCid2 = await wrangler.deleteRecord(rootCid1, key);

		// verify the tree is empty
		const walker = await NodeWalker.create(store, rootCid2);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(0);
	});

	it('should be a no-op when deleting a non-existent key', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const key1 = 'test/key1';
		const key2 = 'test/key2';
		const value = await createCid('test-value');

		const rootCid1 = await wrangler.putRecord(null, key1, value);
		const rootCid2 = await wrangler.deleteRecord(rootCid1, key2);

		// CIDs should be identical since nothing changed
		expect(rootCid1).toBe(rootCid2);
	});

	it('should handle multiple puts and deletes', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;

		// add several keys
		const keys = ['coll/a', 'coll/b', 'coll/c', 'coll/d', 'coll/e'];
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// delete some keys
		rootCid = await wrangler.deleteRecord(rootCid, 'coll/b');
		rootCid = await wrangler.deleteRecord(rootCid, 'coll/d');

		// verify remaining entries
		const walker = await NodeWalker.create(store, rootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(3);
		expect(entries[0][0]).toBe('coll/a');
		expect(entries[1][0]).toBe('coll/c');
		expect(entries[2][0]).toBe('coll/e');
	});

	it('should maintain sort order across operations', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;

		// add keys in random order
		const keys = ['coll/e', 'coll/b', 'coll/d', 'coll/a', 'coll/c'];
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// verify entries are in sorted order
		const walker = await NodeWalker.create(store, rootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(5);
		expect(entries[0][0]).toBe('coll/a');
		expect(entries[1][0]).toBe('coll/b');
		expect(entries[2][0]).toBe('coll/c');
		expect(entries[3][0]).toBe('coll/d');
		expect(entries[4][0]).toBe('coll/e');
	});

	it('should handle deleting from a tree with multiple levels', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;

		// add many keys to create a multi-level tree
		const keys = Array.from({ length: 20 }, (_, i) => `coll/${i.toString().padStart(3, '0')}`);
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// delete half the keys
		for (let i = 0; i < keys.length; i += 2) {
			rootCid = await wrangler.deleteRecord(rootCid, keys[i]);
		}

		// verify the remaining keys
		const walker = await NodeWalker.create(store, rootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(10);
		for (let i = 0; i < 10; i++) {
			expect(entries[i][0]).toBe(keys[i * 2 + 1]);
		}
	});

	it('should handle putting and deleting the same key multiple times', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;

		const key = 'test/key';
		const value1 = await createCid('value-1');
		const value2 = await createCid('value-2');

		// put, delete, put again
		rootCid = await wrangler.putRecord(rootCid, key, value1);
		rootCid = await wrangler.deleteRecord(rootCid, key);
		rootCid = await wrangler.putRecord(rootCid, key, value2);

		// verify the final value
		const walker = await NodeWalker.create(store, rootCid);
		const entries: Array<[string, any]> = [];
		for await (const entry of walker.entries()) {
			entries.push(entry);
		}

		expect(entries.length).toBe(1);
		expect(entries[0][0]).toBe(key);
		expect(entries[0][1].$link).toBe(value2.$link);
	});

	it('should handle empty tree deletion', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const emptyNode = MSTNode.empty();
		await store.put(emptyNode);
		const emptyCid = (await emptyNode.cid()).$link;

		const key = 'test/key';
		const newRootCid = await wrangler.deleteRecord(emptyCid, key);

		// should be no-op
		expect(newRootCid).toBe(emptyCid);
	});

	describe('malformed trees', () => {
		it('rejects inserting into a subtree at the wrong height', async () => {
			const store = new NodeStore(new MemoryBlockStore());
			const wrangler = new NodeWrangler(store);
			const value = await createCid('value');

			// `lo` sits below `hi` but carries a height-1 key, where height 0 is expected
			const lo = findKey(1);
			const hi = findKey(1, lo);
			const inserted = findKey(0);
			expect(inserted < hi).toBe(true);

			const child = await store.put(await MSTNode.create([lo], [value], [null, null]));
			const root = await store.put(await MSTNode.create([hi], [value], [await child.cid(), null]));

			await expect(wrangler.putRecord((await root.cid()).$link, inserted, value)).rejects.toThrow(
				`inconsistent key heights`,
			);
		});

		it('rejects merging sibling subtrees at different heights', async () => {
			const store = new NodeStore(new MemoryBlockStore());
			const wrangler = new NodeWrangler(store);
			const value = await createCid('value');

			// deleting `mid` merges a height-0 left subtree with a height-1 right subtree
			const left = findKey(0);
			const mid = findKey(1, left);
			const right = findKey(1, mid);

			const leftNode = await store.put(await MSTNode.create([left], [value], [null, null]));
			const rightNode = await store.put(await MSTNode.create([right], [value], [null, null]));
			const root = await store.put(
				await MSTNode.create([mid], [value], [await leftNode.cid(), await rightNode.cid()]),
			);

			await expect(wrangler.deleteRecord((await root.cid()).$link, mid)).rejects.toThrow(
				`inconsistent key heights`,
			);
		});
	});
});
