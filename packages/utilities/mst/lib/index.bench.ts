import * as CID from '@atcute/cid';
import * as TID from '@atcute/tid';

import { bench, do_not_optimize, run, summary } from 'mitata';

import { NodeStore } from './node-store.ts';
import { NodeWalker } from './node-walker.ts';
import { NodeWrangler } from './node-wrangler.ts';
import { MemoryBlockStore } from './stores.ts';

// deterministic TID record keys in creation order
const makeKeys = (count: number): string[] => {
	const keys: string[] = [];
	let t = 1_700_000_000_000_000;

	for (let i = 0; i < count; i++) {
		t += 1_000 + ((i * 7919) % 50_000);
		keys.push(`app.bsky.feed.post/${TID.create(t, 0)}`);
	}

	return keys;
};

const value = CID.toCidLink(CID.fromDigest(CID.CODEC_DCBOR, new Uint8Array(32).fill(7)));

const buildTree = async (keys: string[]): Promise<{ root: string; store: MemoryBlockStore }> => {
	const store = new MemoryBlockStore();
	const wrangler = new NodeWrangler(new NodeStore(store));

	let root: string | null = null;
	for (const key of keys) {
		root = await wrangler.putRecord(root, key, value);
	}

	return { root: root!, store };
};

const keys = makeKeys(5_000);
const tree = await buildTree(keys);

summary(() => {
	bench('putRecord 5k keys', async () => {
		return do_not_optimize(await buildTree(keys));
	});

	bench('walk 5k entries (cold cache)', async () => {
		const walker = await NodeWalker.create(new NodeStore(tree.store), tree.root);

		let count = 0;
		for await (const _ of walker.entries()) {
			count++;
		}

		return do_not_optimize(count);
	});
});

await run();
