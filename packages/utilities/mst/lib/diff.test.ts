import * as CID from '@atcute/cid';
import { encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { DeltaType, mstDiff, recordDiff, verySlowMstDiff } from './diff.js';
import { NodeStore } from './node-store.js';
import { NodeWrangler } from './node-wrangler.js';
import { MemoryBlockStore } from './stores.js';

const createCid = async (data: string) => {
	const bytes = encodeUtf8(data);
	return CID.toCidLink(await CID.create(0x55, bytes));
};

describe('mstDiff', () => {
	it('should detect created records', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// Build tree A with 2 records
		let rootA: string | null = null;
		rootA = await wrangler.putRecord(rootA, 'a/1', await createCid('value-a1'));
		rootA = await wrangler.putRecord(rootA, 'b/2', await createCid('value-b2'));

		// Build tree B with 3 records (added c/3)
		let rootB: string | null = null;
		rootB = await wrangler.putRecord(rootB, 'a/1', await createCid('value-a1'));
		rootB = await wrangler.putRecord(rootB, 'b/2', await createCid('value-b2'));
		rootB = await wrangler.putRecord(rootB, 'c/3', await createCid('value-c3'));

		const [created, deleted] = await mstDiff(store, rootA, rootB);

		expect(created.size).toBeGreaterThan(0);
		// Note: deleted might contain the old root node that was replaced
		// expect(deleted.size).toBe(0);

		// Verify record diff
		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		expect(deltas.length).toBe(1);
		expect(deltas[0].deltaType).toBe(DeltaType.CREATED);
		expect(deltas[0].path).toBe('c/3');
		expect(deltas[0].priorValue).toBe(null);
		expect(deltas[0].laterValue).not.toBe(null);
	});

	it('should detect deleted records', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// Build tree A with 3 records
		let rootA: string | null = null;
		rootA = await wrangler.putRecord(rootA, 'a/1', await createCid('value-a1'));
		rootA = await wrangler.putRecord(rootA, 'b/2', await createCid('value-b2'));
		rootA = await wrangler.putRecord(rootA, 'c/3', await createCid('value-c3'));

		// Build tree B with 2 records (deleted c/3)
		let rootB: string | null = null;
		rootB = await wrangler.putRecord(rootB, 'a/1', await createCid('value-a1'));
		rootB = await wrangler.putRecord(rootB, 'b/2', await createCid('value-b2'));

		const [created, deleted] = await mstDiff(store, rootA, rootB);

		// Note: created might contain the new root node that was created
		// expect(created.size).toBe(0);
		expect(deleted.size).toBeGreaterThan(0);

		// Verify record diff
		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		expect(deltas.length).toBe(1);
		expect(deltas[0].deltaType).toBe(DeltaType.DELETED);
		expect(deltas[0].path).toBe('c/3');
		expect(deltas[0].priorValue).not.toBe(null);
		expect(deltas[0].laterValue).toBe(null);
	});

	it('should detect updated records', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// Build tree A
		let rootA: string | null = null;
		rootA = await wrangler.putRecord(rootA, 'a/1', await createCid('value-a1'));
		rootA = await wrangler.putRecord(rootA, 'b/2', await createCid('value-b2'));

		// Build tree B with updated value for b/2
		let rootB: string | null = null;
		rootB = await wrangler.putRecord(rootB, 'a/1', await createCid('value-a1'));
		rootB = await wrangler.putRecord(rootB, 'b/2', await createCid('value-b2-updated'));

		const [created, deleted] = await mstDiff(store, rootA, rootB);

		expect(created.size).toBeGreaterThan(0);
		expect(deleted.size).toBeGreaterThan(0);

		// Verify record diff
		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		expect(deltas.length).toBe(1);
		expect(deltas[0].deltaType).toBe(DeltaType.UPDATED);
		expect(deltas[0].path).toBe('b/2');
		expect(deltas[0].priorValue).not.toBe(null);
		expect(deltas[0].laterValue).not.toBe(null);
		expect(deltas[0].priorValue?.$link).not.toBe(deltas[0].laterValue?.$link);
	});

	it('should handle identical trees', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let root: string | null = null;
		root = await wrangler.putRecord(root, 'a/1', await createCid('value-a1'));
		root = await wrangler.putRecord(root, 'b/2', await createCid('value-b2'));

		const [created, deleted] = await mstDiff(store, root, root);

		expect(created.size).toBe(0);
		expect(deleted.size).toBe(0);

		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		expect(deltas.length).toBe(0);
	});

	it('should handle empty to non-empty tree', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		const emptyRoot = (await store.get(null).then((n) => n.cid())).$link;

		let rootB: string | null = null;
		rootB = await wrangler.putRecord(rootB, 'a/1', await createCid('value-a1'));
		rootB = await wrangler.putRecord(rootB, 'b/2', await createCid('value-b2'));

		const [created, deleted] = await mstDiff(store, emptyRoot, rootB);

		expect(created.size).toBeGreaterThan(0);

		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		expect(deltas.length).toBe(2);
		expect(deltas.every((d) => d.deltaType === DeltaType.CREATED)).toBe(true);
	});

	it('should handle non-empty to empty tree', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootA: string | null = null;
		rootA = await wrangler.putRecord(rootA, 'a/1', await createCid('value-a1'));
		rootA = await wrangler.putRecord(rootA, 'b/2', await createCid('value-b2'));

		const emptyRoot = (await store.get(null).then((n) => n.cid())).$link;

		const [created, deleted] = await mstDiff(store, rootA, emptyRoot);

		expect(deleted.size).toBeGreaterThan(0);

		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		expect(deltas.length).toBe(2);
		expect(deltas.every((d) => d.deltaType === DeltaType.DELETED)).toBe(true);
	});

	it('should handle multiple operations', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// Tree A: a/1, b/2, c/3
		let rootA: string | null = null;
		rootA = await wrangler.putRecord(rootA, 'a/1', await createCid('value-a1'));
		rootA = await wrangler.putRecord(rootA, 'b/2', await createCid('value-b2'));
		rootA = await wrangler.putRecord(rootA, 'c/3', await createCid('value-c3'));

		// Tree B: a/1 (same), b/2 (updated), d/4 (new), c/3 deleted
		let rootB: string | null = null;
		rootB = await wrangler.putRecord(rootB, 'a/1', await createCid('value-a1'));
		rootB = await wrangler.putRecord(rootB, 'b/2', await createCid('value-b2-updated'));
		rootB = await wrangler.putRecord(rootB, 'd/4', await createCid('value-d4'));

		const [created, deleted] = await mstDiff(store, rootA, rootB);

		const deltas = [];
		for await (const delta of recordDiff(store, created, deleted)) {
			deltas.push(delta);
		}

		// Should have: 1 created (d/4), 1 updated (b/2), 1 deleted (c/3)
		expect(deltas.length).toBe(3);

		const deltasByType = {
			[DeltaType.CREATED]: deltas.filter((d) => d.deltaType === DeltaType.CREATED),
			[DeltaType.UPDATED]: deltas.filter((d) => d.deltaType === DeltaType.UPDATED),
			[DeltaType.DELETED]: deltas.filter((d) => d.deltaType === DeltaType.DELETED),
		};

		expect(deltasByType[DeltaType.CREATED].length).toBe(1);
		expect(deltasByType[DeltaType.CREATED][0].path).toBe('d/4');

		expect(deltasByType[DeltaType.UPDATED].length).toBe(1);
		expect(deltasByType[DeltaType.UPDATED][0].path).toBe('b/2');

		expect(deltasByType[DeltaType.DELETED].length).toBe(1);
		expect(deltasByType[DeltaType.DELETED][0].path).toBe('c/3');
	});
});

describe('verySlowMstDiff', () => {
	it('should match mstDiff results', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// Build two different trees
		let rootA: string | null = null;
		rootA = await wrangler.putRecord(rootA, 'a/1', await createCid('value-a1'));
		rootA = await wrangler.putRecord(rootA, 'b/2', await createCid('value-b2'));
		rootA = await wrangler.putRecord(rootA, 'c/3', await createCid('value-c3'));

		let rootB: string | null = null;
		rootB = await wrangler.putRecord(rootB, 'a/1', await createCid('value-a1'));
		rootB = await wrangler.putRecord(rootB, 'b/2', await createCid('value-b2-updated'));
		rootB = await wrangler.putRecord(rootB, 'd/4', await createCid('value-d4'));

		const [createdFast, deletedFast] = await mstDiff(store, rootA, rootB);
		const [createdSlow, deletedSlow] = await verySlowMstDiff(store, rootA, rootB);

		// Both should produce the same sets
		expect(createdFast.size).toBe(createdSlow.size);
		expect(deletedFast.size).toBe(deletedSlow.size);

		for (const cid of createdFast) {
			expect(createdSlow.has(cid)).toBe(true);
		}

		for (const cid of deletedFast) {
			expect(deletedSlow.has(cid)).toBe(true);
		}
	});
});
