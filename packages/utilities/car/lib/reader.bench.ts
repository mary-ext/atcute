import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as CID from '@atcute/cid';

import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromUint8Array } from './reader.ts';
import { serializeCarEntry, serializeCarHeader } from './writer.ts';

interface CarBlock {
	cid: Uint8Array;
	data: Uint8Array;
}

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const seeded = (seed: number) => {
	let x = seed | 0;

	return () => {
		x ^= x << 13;
		x ^= x >>> 17;
		x ^= x << 5;
		return x >>> 0;
	};
};

const collectCarFiles = (dir: string): string[] => {
	const root = resolve(SCRIPT_DIR, dir);
	const out: string[] = [];
	const stack = [root];

	while (stack.length > 0) {
		const current = stack.pop()!;
		const entries = readdirSync(current, { withFileTypes: true });

		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			const path = resolve(current, entry.name);

			if (entry.isDirectory()) {
				stack.push(path);
			} else if (entry.isFile() && path.endsWith('.car')) {
				out.push(path);
			}
		}
	}

	out.sort();
	return out;
};

const joinChunks = (chunks: Uint8Array[]): Uint8Array => {
	let total = 0;
	for (let i = 0; i < chunks.length; i++) {
		total += chunks[i].length;
	}

	const out = new Uint8Array(total);
	let offset = 0;
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		out.set(chunk, offset);
		offset += chunk.length;
	}

	return out;
};

const makeSynthetic = (entries: number, payloadSize: number): Uint8Array => {
	const rand = seeded(0x5eed1234 ^ entries ^ payloadSize);
	const blocks: CarBlock[] = [];

	for (let i = 0; i < entries; i++) {
		const digest = new Uint8Array(32);
		for (let j = 0; j < 32; j++) {
			digest[j] = (rand() + i + j * 13) & 0xff;
		}

		const cid = CID.fromDigest(CID.CODEC_DCBOR, digest);
		const payload = new Uint8Array(payloadSize + (i & 31));
		for (let j = 0; j < payload.length; j++) {
			payload[j] = (rand() + i + j) & 0xff;
		}

		blocks.push({ cid: cid.bytes, data: payload });
	}

	const root = CID.toCidLink(CID.fromDigest(CID.CODEC_DCBOR, new Uint8Array(32).fill(9)));
	const chunks: Uint8Array[] = [serializeCarHeader([root])];

	for (let i = 0; i < blocks.length; i++) {
		chunks.push(serializeCarEntry(blocks[i].cid, blocks[i].data));
	}

	return joinChunks(chunks);
};

const checksumForOf = (bytes: Uint8Array): number => {
	const car = fromUint8Array(bytes);
	let sum = car.roots.length;

	for (const entry of car) {
		sum += entry.bytes.length;
		sum += entry.cid.bytes[35] ?? 0;
	}

	return sum;
};

const checksumNextLoop = (bytes: Uint8Array): number => {
	const car = fromUint8Array(bytes);
	let sum = car.roots.length;

	const iterator = car[Symbol.iterator]();
	while (true) {
		const next = iterator.next();
		if (next.done) {
			break;
		}

		const entry = next.value;
		sum += entry.bytes.length;
		sum += entry.cid.bytes[35] ?? 0;
	}

	return sum;
};

const fixtures = collectCarFiles('../../mst/mst-test-suite/cars').map(
	(file) => new Uint8Array(readFileSync(file)),
);
const synthetic = makeSynthetic(20_000, 128);

summary(() => {
	bench('fromUint8Array fixtures (for..of)', function* () {
		yield {
			[0]() {
				return fixtures;
			},
			bench(dataset: Uint8Array[]) {
				let sum = 0;
				for (let i = 0; i < dataset.length; i++) {
					sum += checksumForOf(dataset[i]);
				}
				return do_not_optimize(sum);
			},
		};
	});

	bench('fromUint8Array fixtures (next loop)', function* () {
		yield {
			[0]() {
				return fixtures;
			},
			bench(dataset: Uint8Array[]) {
				let sum = 0;
				for (let i = 0; i < dataset.length; i++) {
					sum += checksumNextLoop(dataset[i]);
				}
				return do_not_optimize(sum);
			},
		};
	});
});

summary(() => {
	bench('fromUint8Array synthetic 20k (for..of)', function* () {
		yield {
			[0]() {
				return synthetic;
			},
			bench(bytes: Uint8Array) {
				return do_not_optimize(checksumForOf(bytes));
			},
		};
	});

	bench('fromUint8Array synthetic 20k (next loop)', function* () {
		yield {
			[0]() {
				return synthetic;
			},
			bench(bytes: Uint8Array) {
				return do_not_optimize(checksumNextLoop(bytes));
			},
		};
	});
});

await run();
