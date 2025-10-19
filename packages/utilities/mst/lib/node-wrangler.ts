import type { CidLink } from '@atcute/cid';

import { MSTNode, getKeyHeight } from './node.js';
import { NodeStore } from './node-store.js';

/**
 * array helper: replaces element at index with a new value
 */
const replaceAt = <T>(arr: readonly T[], index: number, value: T): readonly T[] => {
	return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
};

/**
 * array helper: inserts element at index
 */
const insertAt = <T>(arr: readonly T[], index: number, value: T): readonly T[] => {
	return [...arr.slice(0, index), value, ...arr.slice(index)];
};

/**
 * array helper: removes element at index
 */
const removeAt = <T>(arr: readonly T[], index: number): readonly T[] => {
	return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

/**
 * NodeWrangler is where core MST transformation ops are implemented, backed
 * by a NodeStore
 *
 * the external APIs take a CID (the MST root) and return a CID (the new root),
 * while storing any newly created nodes in the NodeStore.
 *
 * neither method should ever fail - deleting a node that doesn't exist is a nop,
 * and adding the same node twice with the same value is also a nop. Callers
 * can detect these cases by seeing if the initial and final CIDs changed.
 */
export class NodeWrangler {
	/** underlying node store */
	ns: NodeStore;

	constructor(ns: NodeStore) {
		this.ns = ns;
	}

	/**
	 * inserts or updates a record in the MST
	 * @param rootCid CID of the root node (or null for empty tree)
	 * @param key the key to insert/update
	 * @param val the value CID to associate with the key
	 * @returns the new root CID
	 */
	async putRecord(rootCid: string | null, key: string, val: CidLink): Promise<string> {
		const root = await this.ns.get(rootCid);

		if (root.isEmpty) {
			// special case for empty tree
			const newNode = await this._putHere(root, key, val);
			return (await newNode.cid()).$link;
		}

		const newNode = await this._putRecursive(
			root,
			key,
			val,
			await getKeyHeight(key),
			await root.requireHeight(),
		);
		return (await newNode.cid()).$link;
	}

	/**
	 * deletes a record from the MST
	 * @param rootCid CID of the root node (or null for empty tree)
	 * @param key the key to delete
	 * @returns the new root CID
	 */
	async deleteRecord(rootCid: string | null, key: string): Promise<string> {
		const root = await this.ns.get(rootCid);

		// Note: the seemingly redundant outer .get().cid is required to transform
		// a null cid into the cid representing an empty node
		const resultCid = await this._deleteRecursive(
			root,
			key,
			await getKeyHeight(key),
			await root.requireHeight(),
		);
		const squashed = await this._squashTop(resultCid?.$link ?? null);
		const finalNode = await this.ns.get(squashed);

		return (await finalNode.cid()).$link;
	}

	/**
	 * inserts a key-value pair into the current node
	 * @param node the node to insert into
	 * @param key the key to insert
	 * @param val the value to insert
	 * @returns the updated node
	 */
	private async _putHere(node: MSTNode, key: string, val: CidLink): Promise<MSTNode> {
		const idx = node.lowerBound(key);

		// the key is already present!
		if (idx < node.keys.length && node.keys[idx] === key) {
			if (node.values[idx].$link === val.$link) {
				return node; // we can return our old self if there is no change
			}

			return await this.ns.put(
				await MSTNode.create(node.keys, replaceAt(node.values, idx, val), node.subtrees),
			);
		}

		// split the subtree at the insertion point
		const [lsub, rsub] = await this._splitOnKey(node.subtrees[idx], key);

		return await this.ns.put(
			await MSTNode.create(insertAt(node.keys, idx, key), insertAt(node.values, idx, val), [
				...node.subtrees.slice(0, idx),
				lsub,
				rsub,
				...node.subtrees.slice(idx + 1),
			]),
		);
	}

	/**
	 * recursively inserts a key-value pair, growing the tree if necessary
	 * @param node the current node
	 * @param key the key to insert
	 * @param val the value to insert
	 * @param keyHeight the height of the key (based on hash)
	 * @param treeHeight the current tree height
	 * @returns the updated node
	 */
	private async _putRecursive(
		node: MSTNode,
		key: string,
		val: CidLink,
		keyHeight: number,
		treeHeight: number,
	): Promise<MSTNode> {
		if (keyHeight > treeHeight) {
			// we need to grow the tree
			return await this._putRecursive(
				await this.ns.put(await MSTNode.create([], [], [await node.cid()])),
				key,
				val,
				keyHeight,
				treeHeight + 1,
			);
		}

		if (keyHeight < treeHeight) {
			// we need to look below
			const idx = node.lowerBound(key);
			return await this.ns.put(
				await MSTNode.create(
					node.keys,
					node.values,
					replaceAt(
						node.subtrees,
						idx,
						await (
							await this._putRecursive(
								await this.ns.get(node.subtrees[idx]?.$link ?? null),
								key,
								val,
								keyHeight,
								treeHeight - 1,
							)
						).cid(),
					),
				),
			);
		}

		// we can insert here
		return await this._putHere(node, key, val);
	}

	/**
	 * splits a subtree around a key, producing left and right subtrees
	 * @param nodeCid the CID of the subtree to split (or null)
	 * @param key the key to split around
	 * @returns tuple of [left subtree CID, right subtree CID]
	 */
	private async _splitOnKey(nodeCid: CidLink | null, key: string): Promise<[CidLink | null, CidLink | null]> {
		if (nodeCid === null) {
			return [null, null];
		}

		const node = await this.ns.get(nodeCid.$link);
		const idx = node.lowerBound(key);
		const [lsub, rsub] = await this._splitOnKey(node.subtrees[idx], key);

		const leftNode = await this.ns.put(
			await MSTNode.create(node.keys.slice(0, idx), node.values.slice(0, idx), [
				...node.subtrees.slice(0, idx),
				lsub,
			]),
		);

		const rightNode = await this.ns.put(
			await MSTNode.create(node.keys.slice(idx), node.values.slice(idx), [
				rsub,
				...node.subtrees.slice(idx + 1),
			]),
		);

		return [await leftNode._toNullable(), await rightNode._toNullable()];
	}

	/**
	 * strips empty nodes from the top of the tree
	 * @param nodeCid the CID of the node to check
	 * @returns the CID after removing empty top nodes
	 */
	private async _squashTop(nodeCid: string | null): Promise<string | null> {
		const node = await this.ns.get(nodeCid);

		if (node.keys.length > 0) {
			return nodeCid;
		}

		if (node.subtrees[0] === null) {
			return nodeCid;
		}

		return await this._squashTop(node.subtrees[0].$link);
	}

	/**
	 * recursively deletes a key from the tree
	 * @param node the current node
	 * @param key the key to delete
	 * @param keyHeight the height of the key
	 * @param treeHeight the current tree height
	 * @returns the CID of the updated node, or null if it becomes empty
	 */
	private async _deleteRecursive(
		node: MSTNode,
		key: string,
		keyHeight: number,
		treeHeight: number,
	): Promise<CidLink | null> {
		if (keyHeight > treeHeight) {
			// the key cannot possibly be in this tree, no change needed
			return await node._toNullable();
		}

		const idx = node.lowerBound(key);

		if (keyHeight < treeHeight) {
			// the key must be deleted from a subtree
			if (node.subtrees[idx] === null) {
				return await node._toNullable(); // the key cannot be in this subtree, no change needed
			}

			const updated = await this.ns.put(
				await MSTNode.create(
					node.keys,
					node.values,
					replaceAt(
						node.subtrees,
						idx,
						await this._deleteRecursive(
							await this.ns.get(node.subtrees[idx]!.$link),
							key,
							keyHeight,
							treeHeight - 1,
						),
					),
				),
			);

			return await updated._toNullable();
		}

		if (idx === node.keys.length || node.keys[idx] !== key) {
			return await node._toNullable(); // key already not present
		}

		// merge the subtrees on either side of the deleted key
		const merged = await this._merge(node.subtrees[idx], node.subtrees[idx + 1]);

		const updated = await this.ns.put(
			await MSTNode.create(removeAt(node.keys, idx), removeAt(node.values, idx), [
				...node.subtrees.slice(0, idx),
				merged,
				...node.subtrees.slice(idx + 2),
			]),
		);

		return await updated._toNullable();
	}

	/**
	 * merges two adjacent subtrees
	 * @param leftCid CID of the left subtree (or null)
	 * @param rightCid CID of the right subtree (or null)
	 * @returns the CID of the merged subtree (or null if both are null)
	 */
	private async _merge(leftCid: CidLink | null, rightCid: CidLink | null): Promise<CidLink | null> {
		if (leftCid === null) {
			return rightCid; // includes the case where left == right == null
		}
		if (rightCid === null) {
			return leftCid;
		}

		const left = await this.ns.get(leftCid.$link);
		const right = await this.ns.get(rightCid.$link);

		// recursively merge the adjacent subtrees at the boundary
		const mergedBoundary = await this._merge(left.subtrees[left.subtrees.length - 1], right.subtrees[0]);

		const merged = await this.ns.put(
			await MSTNode.create(
				[...left.keys, ...right.keys],
				[...left.values, ...right.values],
				[...left.subtrees.slice(0, -1), mergedBoundary, ...right.subtrees.slice(1)],
			),
		);

		return await merged._toNullable();
	}
}
