import { MissingBlockError } from './errors.ts';
import { MSTNode } from './node.ts';
import type { BlockStore } from './stores.ts';
import LRUCache from './utils/lru.ts';

/**
 * manages caching and storage of MST nodes with LRU eviction
 */
export class NodeStore {
	/** underlying block store for persistent storage */
	store: BlockStore;
	/** LRU cache for recently accessed nodes */
	cache = new LRUCache<string | null, MSTNode>(1024);

	constructor(store: BlockStore) {
		this.store = store;
	}

	/**
	 * retrieves an MST node by its CID, using cache when available
	 * @param cid the CID of the node to retrieve, or null for empty node
	 * @returns the MST node
	 * @throws {MissingBlockError} if the node cannot be found in the store
	 */
	async get(cid: string | null): Promise<MSTNode> {
		let node = this.cache.get(cid);
		if (node === undefined) {
			if (cid === null) {
				node = MSTNode.empty();
				this.cache.put((await node.cid()).$link, node);
			} else {
				const bytes = await this.store.get(cid);
				if (bytes === null) {
					throw new MissingBlockError(cid, 'MST node');
				}

				node = await MSTNode.deserialize(bytes);
				node._bytes = bytes;
			}

			this.cache.put(cid, node);
		}

		return node;
	}

	/**
	 * stores an MST node in both the cache and the underlying block store
	 * @param node the node to store
	 * @returns the same node that was passed in
	 */
	async put(node: MSTNode): Promise<MSTNode> {
		const cid = (await node.cid()).$link;

		this.cache.put(cid, node);
		await this.store.put(cid, await node.serialize());

		return node;
	}
}
