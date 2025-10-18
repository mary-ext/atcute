import { describe, expect, it } from 'vitest';

import * as CID from '@atcute/cid';
import { encodeUtf8 } from '@atcute/uint8array';

import { NodeStore } from './node-store.js';
import { NodeWalker } from './node-walker.js';
import { MSTNode } from './node.js';
import { MemoryBlockStore } from './stores.js';

const createCid = async (data: string) => {
	const bytes = encodeUtf8(data);
	return CID.toCidLink(await CID.create(0x55, bytes));
};

describe('NodeWalker', () => {
	it('should iterate over entries in empty tree', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const emptyNode = MSTNode.empty();
		await store.put(emptyNode);
		const emptyCid = (await emptyNode.cid()).$link;

		const walker = await NodeWalker.create(store, emptyCid);

		const pairs: Array<[string, any]> = [];
		for await (const pair of walker.entries()) {
			pairs.push(pair);
		}

		expect(pairs).toEqual([]);
	});

	it('should iterate over entries in single-entry tree', async () => {
		const store = new NodeStore(new MemoryBlockStore());

		// Create a simple node with one entry
		const testKey = 'test/key';
		const testValue = await createCid('test-value');
		const node = await MSTNode.create([testKey], [testValue], [null, null]);

		await store.put(node);
		const nodeCid = (await node.cid()).$link;

		const walker = await NodeWalker.create(store, nodeCid);

		const pairs: Array<[string, any]> = [];
		for await (const pair of walker.entries()) {
			pairs.push(pair);
		}

		expect(pairs.length).toBe(1);
		expect(pairs[0][0]).toBe(testKey);
		expect(pairs[0][1]).toEqual(testValue);
	});

	it('should check done correctly', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const emptyNode = MSTNode.empty();
		await store.put(emptyNode);
		const emptyCid = (await emptyNode.cid()).$link;

		const walker = await NodeWalker.create(store, emptyCid);

		expect(walker.done).toBe(true);
	});

	it('should get height correctly', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const emptyNode = MSTNode.empty();
		await store.put(emptyNode);
		const emptyCid = (await emptyNode.cid()).$link;

		const walker = await NodeWalker.create(store, emptyCid);

		expect(walker.height).toBe(0);
	});

	it('should iterate over all nodes', async () => {
		const store = new NodeStore(new MemoryBlockStore());

		const testKey = 'test/key';
		const testValue = await createCid('test-value');
		const node = await MSTNode.create([testKey], [testValue], [null, null]);

		await store.put(node);
		const nodeCid = (await node.cid()).$link;

		const walker = await NodeWalker.create(store, nodeCid);

		const nodes: MSTNode[] = [];
		for await (const n of walker.nodes()) {
			nodes.push(n);
		}

		expect(nodes.length).toBe(1);
		expect(nodes[0]).toBe(walker.frame.node);
	});

	it('should get nodeCids', async () => {
		const store = new NodeStore(new MemoryBlockStore());

		const testKey = 'test/key';
		const testValue = await createCid('test-value');
		const node = await MSTNode.create([testKey], [testValue], [null, null]);

		await store.put(node);
		const nodeCid = (await node.cid()).$link;

		const walker = await NodeWalker.create(store, nodeCid);

		const cids: any[] = [];
		for await (const cid of walker.nodeCids()) {
			cids.push(cid);
		}

		expect(cids.length).toBe(1);
		expect(cids[0].$link).toBe(nodeCid);
	});
});
