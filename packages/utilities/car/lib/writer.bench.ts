import * as CID from '@atcute/cid';

import { bench, do_not_optimize, run, summary } from 'mitata';

import { serializeCarEntry } from './writer.ts';

const makeBlocks = (count: number, payloadSize: number): { cid: Uint8Array; data: Uint8Array }[] => {
	const blocks: { cid: Uint8Array; data: Uint8Array }[] = [];

	for (let i = 0; i < count; i++) {
		const digest = new Uint8Array(32);
		for (let j = 0; j < 32; j++) {
			digest[j] = (i + j * 13) & 0xff;
		}

		blocks.push({
			cid: CID.fromDigest(CID.CODEC_DCBOR, digest).bytes,
			data: new Uint8Array(payloadSize + (i & 31)),
		});
	}

	return blocks;
};

const blocks = makeBlocks(20_000, 128);

summary(() => {
	bench('serializeCarEntry 20k', () => {
		let sum = 0;
		for (let i = 0; i < blocks.length; i++) {
			sum += serializeCarEntry(blocks[i].cid, blocks[i].data).length;
		}

		return do_not_optimize(sum);
	});
});

await run();
