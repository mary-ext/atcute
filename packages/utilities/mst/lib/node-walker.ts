import type { CidLink } from '@atcute/cid';

import { NodeStore } from './node-store.js';
import { MSTNode, getKeyHeight } from './node.js';
import Stack from './utils/stack.js';

/**
 * represents a single frame in the NodeWalker traversal stack
 * tracks position within a node and the current search boundaries
 */
export interface StackFrame {
	/** current MST node */
	node: MSTNode;
	/** left boundary path for this frame */
	lpath: string;
	/** right boundary path for this frame */
	rpath: string;
	/** current cursor index within the node */
	idx: number;
}

/**
 * provides a cursor-based interface for traversing MST nodes
 * supports tree diffing and various MST query operations
 *
 * a NodeWalker starts at the root of a tree and can walk along or recurse
 * down into subtrees
 *
 * walking "off the end" of a subtree brings you back up to its next non-empty parent
 *
 * recall MSTNode layout:
 *
 * ```
 * keys:  (lpath)  (0,    1,    2,    3)  (rpath)
 * vals:           (0,    1,    2,    3)
 * subtrees:    (0,    1,    2,    3,    4)
 * ```
 */
export class NodeWalker {
	static readonly PATH_MIN = ''; // string that compares less than all legal path strings
	static readonly PATH_MAX = '\xff'; // string that compares greater than all legal path strings

	/** node store for fetching nodes */
	readonly store: NodeStore;
	/** stack of frames representing the traversal path */
	readonly stack: Stack<StackFrame>;
	/** height of the root node */
	readonly rootHeight: number;
	/** whether to skip height validation (for trusted trees) */
	readonly trusted: boolean;

	private constructor(store: NodeStore, stack: Stack<StackFrame>, rootHeight: number, trusted: boolean) {
		this.store = store;
		this.stack = stack;
		this.rootHeight = rootHeight;
		this.trusted = trusted;
	}

	/**
	 * create a new NodeWalker
	 * @param store NodeStore to fetch nodes from
	 * @param rootCid CID of the root node to start walking from
	 * @param lpath left boundary path (defaults to minimum)
	 * @param rpath right boundary path (defaults to maximum)
	 * @param trusted skip height validation checks if true (faster but unsafe for untrusted trees)
	 * @param rootHeight pre-computed root height (optional optimization)
	 * @returns a new NodeWalker instance
	 */
	static async create(
		store: NodeStore,
		rootCid: string | null,
		lpath: string = NodeWalker.PATH_MIN,
		rpath: string = NodeWalker.PATH_MAX,
		trusted: boolean = false,
		rootHeight?: number,
	): Promise<NodeWalker> {
		const node = await store.get(rootCid);
		const height = rootHeight ?? (await node.height());

		if (height === null) {
			throw new Error(`indeterminate node height; provide rootHeight if known`);
		}

		const stack = new Stack<StackFrame>();
		stack.push({
			node,
			lpath,
			rpath,
			idx: 0,
		});

		return new NodeWalker(store, stack, height, trusted);
	}

	/**
	 * create a new walker rooted at the current position's subtree.
	 * treats the subtree as an independent tree for traversal.
	 * @returns a new NodeWalker instance for the subtree
	 */
	async createSubtreeWalker(): Promise<NodeWalker> {
		return await NodeWalker.create(
			this.store,
			this.subtree?.$link ?? null,
			this.lpath,
			this.rpath,
			this.trusted,
			this.height - 1,
		);
	}

	/** current stack frame */
	get frame(): StackFrame {
		const frame = this.stack.peek();
		if (frame === undefined) {
			throw new Error(`stack is empty`);
		}

		return frame;
	}

	/** current height in the tree (decreases as you descend) */
	get height(): number {
		return this.rootHeight - (this.stack.size - 1);
	}

	/** key/path to the left of current cursor position */
	get lpath(): string {
		return this.frame.idx === 0 ? this.frame.lpath : this.frame.node.keys[this.frame.idx - 1];
	}

	/** value (CID) to the left of current cursor position */
	get lval(): CidLink | null {
		return this.frame.idx === 0 ? null : this.frame.node.values[this.frame.idx - 1];
	}

	/** subtree CID at current cursor position (null if no subtree) */
	get subtree(): CidLink | null {
		const subtree = this.frame.node.subtrees[this.frame.idx];
		return subtree ?? null;
	}

	/** key/path to the right of current cursor position */
	get rpath(): string {
		return this.frame.idx === this.frame.node.keys.length
			? this.frame.rpath
			: this.frame.node.keys[this.frame.idx];
	}

	/** value (CID) to the right of current cursor position */
	get rval(): CidLink | null {
		return this.frame.idx === this.frame.node.values.length ? null : this.frame.node.values[this.frame.idx];
	}

	/** whether the walker has reached the end of the tree */
	get done(): boolean {
		// is (not this.stack) really necessary here? is that a reachable state?
		const bottom = this.stack.peekBottom();
		return (
			this.stack.size === 0 || (this.subtree === null && bottom !== undefined && this.rpath === bottom.rpath)
		);
	}

	/** whether the cursor can move right in current node */
	get canGoRight(): boolean {
		return this.frame.idx + 1 < this.frame.node.subtrees.length;
	}

	/**
	 * move cursor right, or up if at end of current node.
	 * automatically recurses up through empty intermediates.
	 * @throws if attempting to navigate beyond root (check done first)
	 */
	rightOrUp(): void {
		if (!this.canGoRight) {
			// we reached the end of this node, go up a level
			this.stack.pop();
			if (this.stack.size === 0) {
				throw new Error(`cannot navigate beyond root; check .done before calling`);
			}
			return this.rightOrUp(); // we need to recurse, to skip over empty intermediates on the way back up
		}
		this.frame.idx += 1;
	}

	/**
	 * move cursor right within current node.
	 * @throws if already at rightmost position (check canGoRight first)
	 */
	right(): void {
		if (!this.canGoRight) {
			throw new Error(`cursor is already at rightmost position in node`);
		}
		this.frame.idx += 1;
	}

	/**
	 * descend into the subtree at current cursor position.
	 * @throws if no subtree exists at current position
	 */
	async down(): Promise<void> {
		const subtree = this.frame.node.subtrees[this.frame.idx];
		if (subtree === null) {
			throw new Error(`cannot descend; no subtree at current position`);
		}

		const subtreeNode = await this.store.get(subtree.$link);

		if (!this.trusted) {
			// if we "trust" the source we can elide this check
			// the "null" case occurs for empty intermediate nodes
			const subtreeHeight = await subtreeNode.height();
			if (subtreeHeight !== null && subtreeHeight !== this.height - 1) {
				throw new Error(`inconsistent subtree height; got=${subtreeHeight} expected=${this.height - 1}`);
			}
		}

		this.stack.push({
			node: subtreeNode,
			lpath: this.lpath,
			rpath: this.rpath,
			idx: 0,
		});
	}

	/**
	 * advance to and return the next key-value pair in the tree.
	 * descends into all subtrees automatically.
	 * @returns Tuple of [key, value CID]
	 */
	async nextEntry(): Promise<[string, CidLink]> {
		while (this.subtree) {
			// recurse down every subtree
			await this.down();
		}
		this.rightOrUp();
		return [this.lpath, this.lval!]; // the kv pair we just jumped over
	}

	/**
	 * iterate over all key-value pairs in the tree in sorted order.
	 * @yields Tuples of [key, value CID]
	 */
	async *entries(): AsyncIterableIterator<[string, CidLink]> {
		while (!this.done) {
			yield await this.nextEntry();
		}
	}

	/**
	 * iterate over all MST nodes from current position to the end of tree.
	 * @yields MSTNode instances
	 */
	async *nodes(): AsyncIterableIterator<MSTNode> {
		yield this.frame.node;

		while (!this.done) {
			while (this.subtree) {
				// recurse down every subtree
				await this.down();
				yield this.frame.node;
			}

			this.rightOrUp();
		}
	}

	/**
	 * iterate over CIDs of all MST nodes from current position to end of tree.
	 * @yields CID links to nodes
	 */
	async *nodeCids(): AsyncIterableIterator<CidLink> {
		for await (const node of this.nodes()) {
			yield await node.cid();
		}
	}

	/**
	 * iterate over key-value pairs within a specific key range.
	 * @param start start key (inclusive)
	 * @param end end key
	 * @param endInclusive whether end key is inclusive
	 * @yields tuples of [key, value CID] within range
	 */
	async *entriesInRange(
		start: string,
		end: string,
		endInclusive: boolean = false,
	): AsyncIterableIterator<[string, CidLink]> {
		while (true) {
			while (this.rpath < start) {
				this.rightOrUp();
			}
			if (!this.subtree) {
				break;
			}
			await this.down();
		}

		for await (const [k, v] of this.entries()) {
			if (k > end || (!endInclusive && k === end)) {
				break;
			}
			yield [k, v];
		}
	}

	/**
	 * search for a specific key (rpath) in the tree.
	 * @param rpath key to search for
	 * @returns value CID if found, null otherwise
	 */
	async findRpath(rpath: string): Promise<CidLink | null> {
		const rpathHeight = await getKeyHeight(rpath);
		while (true) {
			// if the rpath we're looking for is higher than the current cursor,
			// we're never going to find it (i.e. we early-exit)
			if (rpathHeight > this.height) {
				return null;
			}

			while (this.rpath < rpath) {
				// either look for the rpath, or the right point to go down
				if (!this.canGoRight) {
					return null;
				}

				this.right();
			}

			if (this.rpath === rpath) {
				return this.rval; // found it!
			}

			if (!this.subtree) {
				return null; // need to go down, but we can't
			}

			await this.down();
		}
	}
}
