import { beforeAll, describe, expect, it } from 'vitest';
import * as v from 'valibot';

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { fromUint8Array } from '@atcute/car/v4/car-reader';
import * as CID from '@atcute/cid';

import { setMany } from './blockmap.js';
import { DeltaType, mstDiff, recordDiff } from './diff.js';
import { NodeStore } from './node-store.js';
import { NodeWrangler } from './node-wrangler.js';
import { buildExclusionProof, buildInclusionProof } from './proof.js';
import {
	LoggingBlockStore,
	MemoryBlockStore,
	OverlayBlockStore,
	ReadonlyMemoryBlockStore,
} from './stores.js';

const mstDiffTestCaseSchema = v.object({
	$type: v.literal('mst-diff'),
	description: v.string(),
	inputs: v.object({
		mst_a: v.string(),
		mst_b: v.string(),
	}),
	results: v.object({
		created_nodes: v.array(v.string()),
		deleted_nodes: v.array(v.string()),
		record_ops: v.array(
			v.object({
				rpath: v.string(),
				old_value: v.nullable(v.string()),
				new_value: v.nullable(v.string()),
			}),
		),
		proof_nodes: v.array(v.string()),
		inductive_proof_nodes: v.array(v.string()),
	}),
});

type MstDiffTestCase = v.InferOutput<typeof mstDiffTestCaseSchema>;

const testSuiteRoot = path.join(__dirname, '../mst-test-suite');

/**
 * Load a CAR file into a MemoryBlockStore and extract the root CID
 */
const loadCar = async (relname: string): Promise<{ store: ReadonlyMemoryBlockStore; root: string }> => {
	const filename = path.join(testSuiteRoot, relname);
	const bytes = await fs.readFile(filename);

	const car = fromUint8Array(bytes);
	const store = new MemoryBlockStore();

	for (const entry of car) {
		const cidStr = CID.toCidLink(entry.cid).$link;
		store.blocks.set(cidStr, entry.bytes as Uint8Array<ArrayBuffer>);
	}

	if (car.roots.length !== 1) {
		throw new Error(`expected exactly 1 root in CAR, got ${car.roots.length}`);
	}

	const root = car.roots[0].$link;
	return { store, root };
};

const testCases = await (async () => {
	const testsDir = path.join(testSuiteRoot, 'tests');

	const testCases: Array<{ path: string; description: string; testCase: MstDiffTestCase }> = [];

	for await (const name of fs.glob('**/*.json', { cwd: testsDir })) {
		const filename = path.join(testsDir, name);

		const raw = await fs.readFile(filename, 'utf-8');
		const json = JSON.parse(raw);

		const testCase = v.parse(mstDiffTestCaseSchema, json);

		testCases.push({
			path: filename,
			description: testCase.description.replace(`procedurally generated MST diff test case `, ``),
			testCase,
		});
	}

	return testCases;
})();

describe('MST Test Suite', () => {
	describe.each(testCases)('$description', ({ testCase }) => {
		let storeA: ReadonlyMemoryBlockStore;
		let rootA: string;

		let storeB: ReadonlyMemoryBlockStore;
		let rootB: string;

		beforeAll(async () => {
			({ store: storeA, root: rootA } = await loadCar(testCase.inputs.mst_a));
			({ store: storeB, root: rootB } = await loadCar(testCase.inputs.mst_b));
		});

		it('computes the correct mstDiff', async () => {
			const combinedStore = new MemoryBlockStore();
			setMany(combinedStore.blocks, storeA.blocks);
			setMany(combinedStore.blocks, storeB.blocks);

			const nodeStore = new NodeStore(combinedStore);

			const [createdNodes, deletedNodes] = await mstDiff(nodeStore, rootA, rootB);

			const expectedCreated = new Set(testCase.results.created_nodes);
			expect(createdNodes).toEqual(expectedCreated);

			const expectedDeleted = new Set(testCase.results.deleted_nodes);
			expect(deletedNodes).toEqual(expectedDeleted);
		});

		it('computes the correct recordDiff', async () => {
			const combinedStore = new MemoryBlockStore();
			setMany(combinedStore.blocks, storeA.blocks);
			setMany(combinedStore.blocks, storeB.blocks);

			const nodeStore = new NodeStore(combinedStore);

			const [createdNodes, deletedNodes] = await mstDiff(nodeStore, rootA, rootB);

			const deltas = await Array.fromAsync(recordDiff(nodeStore, createdNodes, deletedNodes));
			deltas.sort((a, b) => +(a.path > b.path) - +(a.path < b.path));

			const expectance = testCase.results.record_ops.toSorted(
				(a, b) => +(a.rpath > b.rpath) - +(a.rpath < b.rpath),
			);

			expect(deltas.length).toBe(expectance.length);

			for (let idx = 0, len = deltas.length; idx < len; idx++) {
				const actual = deltas[idx];
				const expected = expectance[idx];

				expect(actual.path).toBe(expected.rpath);
				expect(actual.priorValue?.$link ?? null).toBe(expected.old_value);
				expect(actual.laterValue?.$link ?? null).toBe(expected.new_value);

				// Verify delta type is correct
				if (expected.old_value === null) {
					expect(actual.deltaType).toBe(DeltaType.CREATED);
				} else if (expected.new_value === null) {
					expect(actual.deltaType).toBe(DeltaType.DELETED);
				} else {
					expect(actual.deltaType).toBe(DeltaType.UPDATED);
				}
			}
		});

		it('computes the correct proof_nodes', async () => {
			// create combined store
			const combinedStore = new MemoryBlockStore();
			setMany(combinedStore.blocks, storeA.blocks);
			setMany(combinedStore.blocks, storeB.blocks);

			const nodeStore = new NodeStore(combinedStore);

			// collect proof nodes for all record operations
			const proofNodes = new Set<string>();

			for (const op of testCase.results.record_ops) {
				let proof: Set<string>;

				if (op.old_value === null) {
					// CREATED: inclusion proof for new record in rootB
					proof = await buildInclusionProof(nodeStore, rootB, op.rpath);
				} else if (op.new_value === null) {
					// DELETED: exclusion proof in rootB
					proof = await buildExclusionProof(nodeStore, rootB, op.rpath);
				} else {
					// UPDATED: inclusion proof for updated record in rootB
					proof = await buildInclusionProof(nodeStore, rootB, op.rpath);
				}

				// add all proof nodes to the set
				for (const cid of proof) {
					proofNodes.add(cid);
				}
			}

			// compare against expected proof_nodes (as sets, order doesn't matter)
			const expectedProofNodes = new Set(testCase.results.proof_nodes);
			expect(proofNodes).toEqual(expectedProofNodes);
		});

		it('computes the correct inductive_proof_nodes', async () => {
			// create combined store
			const combinedStore = new MemoryBlockStore();
			setMany(combinedStore.blocks, storeA.blocks);
			setMany(combinedStore.blocks, storeB.blocks);

			// inductive proofs: nodes that get READ when applying ops in REVERSE order
			// this is used for MST operation inversion (verifying B→A instead of A→B)

			const loggingStore = new LoggingBlockStore(combinedStore);

			const overlayStore = new OverlayBlockStore(new MemoryBlockStore(), loggingStore);
			const nodeStore = new NodeStore(overlayStore);
			const wrangler = new NodeWrangler(nodeStore);

			// start from rootB and apply operations in REVERSE order
			let currentRoot = rootB;
			const reversedOps = testCase.results.record_ops.toReversed();

			for (const op of reversedOps) {
				if (op.old_value === null) {
					// was CREATE, reverse it with DELETE
					currentRoot = await wrangler.deleteRecord(currentRoot, op.rpath);
				} else {
					// was UPDATE or DELETE, reverse with PUT of old value
					currentRoot = await wrangler.putRecord(currentRoot, op.rpath, { $link: op.old_value });
				}
			}

			// after reversing all operations, we should end up back at rootA
			expect(currentRoot).toBe(rootA);

			// the blocks that were accessed (read) are the inductive proof nodes
			const inductiveProofNodes = loggingStore.accessed;
			const expectedInductiveProofNodes = new Set(testCase.results.inductive_proof_nodes);
			expect(inductiveProofNodes).toEqual(expectedInductiveProofNodes);
		});
	});
});
