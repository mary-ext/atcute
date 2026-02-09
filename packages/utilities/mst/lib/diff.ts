import type { CidLink } from '@atcute/cid';

import type { NodeStore } from './node-store.ts';
import { NodeWalker } from './node-walker.ts';

/**
 * Type of change to a record
 */
export enum DeltaType {
	CREATED = 1,
	UPDATED = 2,
	DELETED = 3,
}

/**
 * Represents a change to a single record
 */
export interface RecordDelta {
	/** type of change */
	deltaType: DeltaType;
	/** record path (collection/rkey) */
	path: string;
	/** CID before the change (null for creates) */
	priorValue: CidLink | null;
	/** CID after the change (null for deletes) */
	laterValue: CidLink | null;
}

/**
 * Given two sets of MST nodes, returns an iterator of record-level changes
 * @param ns the node store
 * @param created set of node CIDs that were created
 * @param deleted set of node CIDs that were deleted
 * @yields record deltas describing the changes
 */
export async function* recordDiff(
	ns: NodeStore,
	created: Set<string>,
	deleted: Set<string>,
): AsyncGenerator<RecordDelta> {
	// Build maps of all keys and values in created/deleted nodes
	const createdKv = new Map<string, CidLink>();
	for (const cid of created) {
		const node = await ns.get(cid);
		for (let i = 0; i < node.keys.length; i++) {
			createdKv.set(node.keys[i], node.values[i]);
		}
	}

	const deletedKv = new Map<string, CidLink>();
	for (const cid of deleted) {
		const node = await ns.get(cid);
		for (let i = 0; i < node.keys.length; i++) {
			deletedKv.set(node.keys[i], node.values[i]);
		}
	}

	// Find keys that were created (in created but not deleted)
	for (const [key, value] of createdKv) {
		if (!deletedKv.has(key)) {
			yield {
				deltaType: DeltaType.CREATED,
				path: key,
				priorValue: null,
				laterValue: value,
			};
		}
	}

	// Find keys that were updated (in both, but with different values)
	for (const [key, newValue] of createdKv) {
		const oldValue = deletedKv.get(key);
		if (oldValue !== undefined && oldValue.$link !== newValue.$link) {
			yield {
				deltaType: DeltaType.UPDATED,
				path: key,
				priorValue: oldValue,
				laterValue: newValue,
			};
		}
	}

	// Find keys that were deleted (in deleted but not created)
	for (const [key, value] of deletedKv) {
		if (!createdKv.has(key)) {
			yield {
				deltaType: DeltaType.DELETED,
				path: key,
				priorValue: value,
				laterValue: null,
			};
		}
	}
}

/**
 * Slow but obvious MST diff implementation for testing
 * Enumerates all nodes in both trees and compares them
 * @param ns the node store
 * @param rootA CID of first MST root
 * @param rootB CID of second MST root
 * @returns tuple of [created nodes, deleted nodes]
 */
export const verySlowMstDiff = async (
	ns: NodeStore,
	rootA: string,
	rootB: string,
): Promise<[Set<string>, Set<string>]> => {
	const walkerA = await NodeWalker.create(ns, rootA);
	const walkerB = await NodeWalker.create(ns, rootB);

	const nodesA = new Set<string>();
	for await (const cid of iterNodeCids(walkerA)) {
		nodesA.add(cid);
	}

	const nodesB = new Set<string>();
	for await (const cid of iterNodeCids(walkerB)) {
		nodesB.add(cid);
	}

	const created = new Set<string>();
	for (const cid of nodesB) {
		if (!nodesA.has(cid)) {
			created.add(cid);
		}
	}

	const deleted = new Set<string>();
	for (const cid of nodesA) {
		if (!nodesB.has(cid)) {
			deleted.add(cid);
		}
	}

	return [created, deleted];
};

/**
 * Helper to iterate over all node CIDs in a tree
 */
async function* iterNodeCids(walker: NodeWalker): AsyncGenerator<string> {
	// Always yield the current node
	yield (await walker.frame.node.cid()).$link;

	// Recursively iterate through the tree
	while (!walker.done) {
		if (walker.subtree !== null) {
			await walker.down();
			yield (await walker.frame.node.cid()).$link;
		} else {
			walker.rightOrUp();
		}
	}
}

// precomputed from `(await MSTNode.empty().cid()).$link`
const EMPTY_NODE_CID = 'bafyreie5737gdxlw5i64vzichcalba3z2v5n6icifvx5xytvske7mr3hpm';

/**
 * Efficiently computes the difference between two MSTs
 * @param ns the node store
 * @param rootA CID of first MST root
 * @param rootB CID of second MST root
 * @returns tuple of [created nodes, deleted nodes]
 */
export const mstDiff = async (
	ns: NodeStore,
	rootA: string,
	rootB: string,
): Promise<[Set<string>, Set<string>]> => {
	const created = new Set<string>(); // nodes in B but not in A
	const deleted = new Set<string>(); // nodes in A but not in B

	const walkerA = await NodeWalker.create(ns, rootA);
	const walkerB = await NodeWalker.create(ns, rootB);

	await mstDiffRecursive(created, deleted, walkerA, walkerB);

	// Remove false positives (nodes that appeared in both sets)
	const middle = new Set<string>();
	for (const cid of created) {
		if (deleted.has(cid)) {
			middle.add(cid);
		}
	}

	for (const cid of middle) {
		created.delete(cid);
		deleted.delete(cid);
	}

	// Special case: if one of the root nodes was empty
	if (rootA === EMPTY_NODE_CID && rootB !== EMPTY_NODE_CID) {
		deleted.add(EMPTY_NODE_CID);
	}
	if (rootB === EMPTY_NODE_CID && rootA !== EMPTY_NODE_CID) {
		created.add(EMPTY_NODE_CID);
	}

	return [created, deleted];
};

/**
 * Recursive helper for mstDiff
 * Theory: most trees that get compared will have lots of shared blocks (which we can skip over)
 * Completely different trees will inevitably have to visit every node.
 */
const mstDiffRecursive = async (
	created: Set<string>,
	deleted: Set<string>,
	a: NodeWalker,
	b: NodeWalker,
): Promise<void> => {
	// Easiest case: nodes are identical
	const aNodeCid = (await a.frame.node.cid()).$link;
	const bNodeCid = (await b.frame.node.cid()).$link;

	if (aNodeCid === bNodeCid) {
		return; // no difference
	}

	// Trivial case: a is empty, all of b is new
	if (a.frame.node.isEmpty) {
		for await (const cid of iterNodeCids(b)) {
			created.add(cid);
		}
		return;
	}

	// Likewise: b is empty, all of a is deleted
	if (b.frame.node.isEmpty) {
		for await (const cid of iterNodeCids(a)) {
			deleted.add(cid);
		}
		return;
	}

	// Now we're onto the hard part
	// NB: these will end up as false-positives if one tree is a subtree of the other
	created.add(bNodeCid);
	deleted.add(aNodeCid);

	// General idea:
	// 1. If one cursor is "behind" the other, catch it up
	// 2. When we're matched up, skip over identical subtrees (and recursively diff non-identical subtrees)
	while (true) {
		// Catch up whichever cursor is behind
		while (a.rpath !== b.rpath) {
			// Catch up cursor a if it's behind
			while (a.rpath < b.rpath && !a.done) {
				if (a.subtree !== null) {
					await a.down();
					deleted.add((await a.frame.node.cid()).$link);
				} else {
					a.rightOrUp();
				}
			}

			// Catch up cursor b likewise
			while (b.rpath < a.rpath && !b.done) {
				if (b.subtree !== null) {
					await b.down();
					created.add((await b.frame.node.cid()).$link);
				} else {
					b.rightOrUp();
				}
			}
		}

		// The rpaths now match, but the subtrees below us might not
		// Recursively diff the subtrees
		const aSubWalker = await a.createSubtreeWalker();
		const bSubWalker = await b.createSubtreeWalker();
		await mstDiffRecursive(created, deleted, aSubWalker, bSubWalker);

		// Check if we can still go right
		const aBottom = a.stack.peekBottom();
		const bBottom = b.stack.peekBottom();

		if (
			aBottom !== undefined &&
			bBottom !== undefined &&
			a.rpath === aBottom.rpath &&
			b.rpath === bBottom.rpath
		) {
			break;
		}

		a.rightOrUp();
		b.rightOrUp();
	}
};
