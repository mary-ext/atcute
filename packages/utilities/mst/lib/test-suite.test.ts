import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { fromUint8Array } from '@atcute/car/v4/car-reader';
import * as CID from '@atcute/cid';

import { DeltaType, mstDiff, recordDiff } from './diff.js';
import { NodeStore } from './node-store.js';
import { MemoryBlockStore } from './stores.js';

interface MstDiffTestCase {
	$type: 'mst-diff';
	description: string;
	inputs: {
		mst_a: string;
		mst_b: string;
	};
	results: {
		created_nodes: string[];
		deleted_nodes: string[];
		record_ops: Array<{
			rpath: string;
			old_value: string | null;
			new_value: string | null;
		}>;
		proof_nodes: string[];
		inductive_proof_nodes: string[];
		firehose_cids: string | string[];
	};
}

/**
 * Load a CAR file into a MemoryBlockStore and extract the root CID
 */
const loadCar = (carPath: string): { store: MemoryBlockStore; root: string } => {
	const testSuiteRoot = join(__dirname, '..', '.research', 'mst-test-suite');
	const fullPath = join(testSuiteRoot, carPath);
	const carBytes = readFileSync(fullPath);

	const car = fromUint8Array(carBytes);
	const store = new MemoryBlockStore();

	// Load all blocks from CAR into the store
	for (const entry of car) {
		const cidStr = CID.toCidLink(entry.cid).$link;
		store.blocks.set(cidStr, entry.bytes);
	}

	// Extract root CID from CAR header
	if (car.roots.length !== 1) {
		throw new Error(`Expected exactly 1 root in CAR, got ${car.roots.length}`);
	}

	const root = car.roots[0].$link;
	return { store, root };
};

/**
 * Recursively find all .json test files in a directory
 */
const findTestFiles = (dir: string): string[] => {
	const results: string[] = [];
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			results.push(...findTestFiles(fullPath));
		} else if (entry.endsWith('.json')) {
			results.push(fullPath);
		}
	}

	return results;
};

/**
 * Load all test cases from the test suite
 */
const loadTestCases = (): Array<{ path: string; testCase: MstDiffTestCase }> => {
	const testSuiteRoot = join(__dirname, '..', '.research', 'mst-test-suite');
	const testsDir = join(testSuiteRoot, 'tests');
	const testFiles = findTestFiles(testsDir);

	const testCases: Array<{ path: string; testCase: MstDiffTestCase }> = [];

	for (const filePath of testFiles) {
		const content = readFileSync(filePath, 'utf-8');
		const testCase = JSON.parse(content) as MstDiffTestCase;

		if (testCase.$type === 'mst-diff') {
			testCases.push({ path: filePath, testCase });
		}
	}

	return testCases;
};

describe('MST Test Suite', () => {
	const allTestCases = loadTestCases();

	// Run all test cases
	const testCases = allTestCases;

	it(`should have loaded test cases (${testCases.length} total)`, () => {
		expect(testCases.length).toBeGreaterThan(1000); // Should have 16k+ tests
	});

	describe.each(testCases)('$testCase.description', ({ testCase }) => {
		it('should compute correct mstDiff', async () => {
			// Load both CARs
			const { store: storeA, root: rootA } = loadCar(testCase.inputs.mst_a);
			const { store: storeB, root: rootB } = loadCar(testCase.inputs.mst_b);

			// Create NodeStores (combine both block stores for access to all blocks)
			// We need an overlay approach since diff needs to read from both trees
			const combinedStore = new MemoryBlockStore();
			for (const [cid, bytes] of storeA.blocks) {
				combinedStore.blocks.set(cid, bytes);
			}
			for (const [cid, bytes] of storeB.blocks) {
				combinedStore.blocks.set(cid, bytes);
			}

			const nodeStore = new NodeStore(combinedStore);

			// Run mstDiff
			const [createdNodes, deletedNodes] = await mstDiff(nodeStore, rootA, rootB);

			// Compare created_nodes (as sets, order doesn't matter)
			const expectedCreated = new Set(testCase.results.created_nodes);
			expect(createdNodes).toEqual(expectedCreated);

			// Compare deleted_nodes (as sets, order doesn't matter)
			const expectedDeleted = new Set(testCase.results.deleted_nodes);
			expect(deletedNodes).toEqual(expectedDeleted);
		});

		it('should compute correct recordDiff', async () => {
			// Load both CARs
			const { store: storeA, root: rootA } = loadCar(testCase.inputs.mst_a);
			const { store: storeB, root: rootB } = loadCar(testCase.inputs.mst_b);

			// Create combined NodeStore
			const combinedStore = new MemoryBlockStore();
			for (const [cid, bytes] of storeA.blocks) {
				combinedStore.blocks.set(cid, bytes);
			}
			for (const [cid, bytes] of storeB.blocks) {
				combinedStore.blocks.set(cid, bytes);
			}

			const nodeStore = new NodeStore(combinedStore);

			// Run mstDiff and recordDiff
			const [createdNodes, deletedNodes] = await mstDiff(nodeStore, rootA, rootB);

			const deltas = [];
			for await (const delta of recordDiff(nodeStore, createdNodes, deletedNodes)) {
				deltas.push(delta);
			}

			// Sort both actual and expected by rpath for comparison
			const sortedDeltas = deltas.sort((a, b) => a.path.localeCompare(b.path));
			const sortedExpected = [...testCase.results.record_ops].sort((a, b) => a.rpath.localeCompare(b.rpath));

			expect(sortedDeltas.length).toBe(sortedExpected.length);

			for (let i = 0; i < sortedDeltas.length; i++) {
				const actual = sortedDeltas[i];
				const expected = sortedExpected[i];

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
	});
});
