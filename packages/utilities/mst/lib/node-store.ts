import { MissingBlockError } from './errors.js';
import { MSTNode } from './node.js';
import type { BlockStore } from './stores.js';

import LRUCache from './utils/lru.js';

export class NodeStore {
	store: BlockStore;
	cache = new LRUCache<string | null, MSTNode>(1024);

	constructor(store: BlockStore) {
		this.store = store;
	}

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

	async put(node: MSTNode): Promise<MSTNode> {
		const cid = (await node.cid()).$link;

		this.cache.put(cid, node);
		await this.store.put(cid, await node.serialize());

		return node;
	}
}
