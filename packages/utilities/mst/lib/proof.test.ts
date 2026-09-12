import * as CID from '@atcute/cid';
import { encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { BlockMismatchError } from './errors.ts';
import { NodeStore } from './node-store.ts';
import { NodeWrangler } from './node-wrangler.ts';
import { MSTNode } from './node.ts';
import {
	InvalidProofError,
	ProofError,
	buildExclusionProof,
	buildInclusionProof,
	verifyExclusion,
	verifyInclusion,
} from './proof.ts';
import { MemoryBlockStore } from './stores.ts';

const createCid = async (data: string) => {
	const bytes = encodeUtf8(data);
	return CID.toCidLink(await CID.create(0x55, bytes));
};

const expectMismatch = async (promise: Promise<void>) => {
	const err = await promise.then(
		() => null,
		(err: unknown) => err,
	);

	expect(err).toBeInstanceOf(InvalidProofError);
	expect((err as InvalidProofError).cause).toBeInstanceOf(BlockMismatchError);
};

describe('Proof', () => {
	it('should build and verify inclusion proof', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// build a tree with some records
		let rootCid: string | null = null;
		const keys = ['a/1', 'b/2', 'c/3'];
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// build inclusion proof for 'b/2'
		const proof = await buildInclusionProof(store, rootCid!, 'b/2');

		expect(proof.size).toBeGreaterThan(0);

		// create a new store with only the proof blocks
		const proofStore = new NodeStore(new MemoryBlockStore());
		for (const cid of proof) {
			const node = await store.get(cid);
			await proofStore.put(node);
		}

		// verify the inclusion proof
		await expect(verifyInclusion(proofStore, rootCid!, 'b/2')).resolves.toBeUndefined();
	});

	it('should build and verify exclusion proof', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		// build a tree with some records
		let rootCid: string | null = null;
		const keys = ['a/1', 'b/2', 'c/3'];
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// build exclusion proof for 'd/4' (doesn't exist)
		const proof = await buildExclusionProof(store, rootCid!, 'd/4');

		expect(proof.size).toBeGreaterThan(0);

		// create a new store with only the proof blocks
		const proofStore = new NodeStore(new MemoryBlockStore());
		for (const cid of proof) {
			const node = await store.get(cid);
			await proofStore.put(node);
		}

		// verify the exclusion proof
		await expect(verifyExclusion(proofStore, rootCid!, 'd/4')).resolves.toBeUndefined();
	});

	it('should throw ProofError when building inclusion proof for non-existent record', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;
		rootCid = await wrangler.putRecord(rootCid, 'a/1', await createCid('value-a'));

		await expect(buildInclusionProof(store, rootCid, 'b/2')).rejects.toThrow(ProofError);
		await expect(buildInclusionProof(store, rootCid, 'b/2')).rejects.toThrow("doesn't exist");
	});

	it('should throw ProofError when building exclusion proof for existing record', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;
		rootCid = await wrangler.putRecord(rootCid, 'a/1', await createCid('value-a'));

		await expect(buildExclusionProof(store, rootCid, 'a/1')).rejects.toThrow(ProofError);
		await expect(buildExclusionProof(store, rootCid, 'a/1')).rejects.toThrow('that exists');
	});

	it('should throw InvalidProofError when verifying inclusion with missing blocks', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;
		const keys = ['a/1', 'b/2', 'c/3'];
		const values = await Promise.all(keys.map((k) => createCid(`value-${k}`)));

		for (let i = 0; i < keys.length; i++) {
			rootCid = await wrangler.putRecord(rootCid, keys[i], values[i]);
		}

		// create a store with no blocks
		const emptyStore = new NodeStore(new MemoryBlockStore());

		await expect(verifyInclusion(emptyStore, rootCid!, 'b/2')).rejects.toThrow(InvalidProofError);
		await expect(verifyInclusion(emptyStore, rootCid!, 'b/2')).rejects.toThrow('missing MST blocks');
	});

	it('should throw InvalidProofError when verifying exclusion with missing blocks', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;
		rootCid = await wrangler.putRecord(rootCid, 'a/1', await createCid('value-a'));

		// create a store with no blocks
		const emptyStore = new NodeStore(new MemoryBlockStore());

		await expect(verifyExclusion(emptyStore, rootCid, 'd/4')).rejects.toThrow(InvalidProofError);
		await expect(verifyExclusion(emptyStore, rootCid, 'd/4')).rejects.toThrow('missing MST blocks');
	});

	it('should throw InvalidProofError when verifying inclusion proof for non-existent record', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;
		rootCid = await wrangler.putRecord(rootCid, 'a/1', await createCid('value-a'));

		// build proof for existing record
		const proof = await buildInclusionProof(store, rootCid, 'a/1');
		const proofStore = new NodeStore(new MemoryBlockStore());
		for (const cid of proof) {
			const node = await store.get(cid);
			await proofStore.put(node);
		}

		// try to verify for a different record
		await expect(verifyInclusion(proofStore, rootCid, 'b/2')).rejects.toThrow(InvalidProofError);
		await expect(verifyInclusion(proofStore, rootCid, 'b/2')).rejects.toThrow('not present in MST');
	});

	it('should throw InvalidProofError when verifying exclusion proof for existing record', async () => {
		const store = new NodeStore(new MemoryBlockStore());
		const wrangler = new NodeWrangler(store);

		let rootCid: string | null = null;
		rootCid = await wrangler.putRecord(rootCid, 'a/1', await createCid('value-a'));

		// build proof for non-existing record
		const proof = await buildExclusionProof(store, rootCid, 'b/2');
		const proofStore = new NodeStore(new MemoryBlockStore());
		for (const cid of proof) {
			const node = await store.get(cid);
			await proofStore.put(node);
		}

		// try to verify exclusion for the existing record
		await expect(verifyExclusion(proofStore, rootCid, 'a/1')).rejects.toThrow(InvalidProofError);
		await expect(verifyExclusion(proofStore, rootCid, 'a/1')).rejects.toThrow('*is* present in MST');
	});

	it('should handle proofs on empty tree', async () => {
		const store = new NodeStore(new MemoryBlockStore());

		const emptyNode = await store.get(null);
		const emptyCid = (await emptyNode.cid()).$link;

		// exclusion proof should work on empty tree
		const proof = await buildExclusionProof(store, emptyCid, 'a/1');
		expect(proof.size).toBeGreaterThan(0);

		const proofStore = new NodeStore(new MemoryBlockStore());
		for (const cid of proof) {
			const node = await store.get(cid);
			await proofStore.put(node);
		}

		await expect(verifyExclusion(proofStore, emptyCid, 'a/1')).resolves.toBeUndefined();

		// inclusion proof should fail on empty tree
		await expect(buildInclusionProof(store, emptyCid, 'a/1')).rejects.toThrow(ProofError);
	});

	describe('tampered blocks', () => {
		const TARGET = 'app.bsky.feed.post/0000000000042';

		const buildTree = async (count: number, flavor: string) => {
			const blocks = new MemoryBlockStore();
			const store = new NodeStore(blocks);
			const wrangler = new NodeWrangler(store);

			let rootCid: string | null = null;
			for (let i = 0; i < count; i++) {
				const rpath = `app.bsky.feed.post/${String(i).padStart(13, '0')}`;
				rootCid = await wrangler.putRecord(rootCid, rpath, await createCid(`${flavor}-${rpath}`));
			}

			return { blocks, store, rootCid: rootCid! };
		};

		it('should refuse a whole tree served under an honest root cid', async () => {
			const honest = await buildTree(256, 'real');
			const forged = await buildTree(256, 'forged');

			// both trees contain the target path, but with different values
			expect(forged.rootCid).not.toBe(honest.rootCid);

			const served = new MemoryBlockStore(forged.blocks.blocks);
			await served.put(honest.rootCid, (await forged.blocks.get(forged.rootCid))!);

			await expectMismatch(verifyInclusion(new NodeStore(served), honest.rootCid, TARGET));
		});

		it('should refuse a substituted node below the root', async () => {
			const honest = await buildTree(256, 'real');

			// proof CIDs are ordered deepest-first
			const [deepest] = await buildInclusionProof(honest.store, honest.rootCid, TARGET);
			expect(deepest).not.toBe(honest.rootCid);

			const served = new MemoryBlockStore(honest.blocks.blocks);
			await served.put(deepest, (await honest.blocks.get(honest.rootCid))!);

			await expectMismatch(verifyInclusion(new NodeStore(served), honest.rootCid, TARGET));
		});

		it('should refuse a tampered exclusion proof', async () => {
			const honest = await buildTree(256, 'real');

			// an empty root would otherwise prove the absence of every key
			const served = new MemoryBlockStore(honest.blocks.blocks);
			await served.put(honest.rootCid, await MSTNode.empty().serialize());

			await expectMismatch(verifyExclusion(new NodeStore(served), honest.rootCid, TARGET));
		});

		it('should not cache a node that failed verification', async () => {
			const honest = await buildTree(16, 'real');

			const served = new MemoryBlockStore(honest.blocks.blocks);
			await served.put(honest.rootCid, await MSTNode.empty().serialize());

			const ns = new NodeStore(served);
			await expect(ns.get(honest.rootCid)).rejects.toThrow(BlockMismatchError);

			await served.put(honest.rootCid, (await honest.blocks.get(honest.rootCid))!);

			const node = await ns.get(honest.rootCid);
			expect((await node.cid()).$link).toBe(honest.rootCid);
		});
	});
});
