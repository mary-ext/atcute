import * as CID from '@atcute/cid';

import { bench, do_not_optimize, run, summary } from 'mitata';

import { fromStream } from './streamed-reader.ts';
import { serializeCarEntry, serializeCarHeader } from './writer.ts';

const seeded = (seed: number) => {
	let x = seed | 0;

	return () => {
		x ^= x << 13;
		x ^= x >>> 17;
		x ^= x << 5;
		return x >>> 0;
	};
};

const joinChunks = (chunks: Uint8Array[]): Uint8Array => {
	let total = 0;
	for (let i = 0; i < chunks.length; i++) {
		total += chunks[i].length;
	}

	const out = new Uint8Array(total);
	let offset = 0;
	for (let i = 0; i < chunks.length; i++) {
		out.set(chunks[i], offset);
		offset += chunks[i].length;
	}

	return out;
};

const makeSynthetic = (entries: number, payloadSize: number): Uint8Array => {
	const rand = seeded(0x5eed1234 ^ entries ^ payloadSize);

	const root = CID.toCidLink(CID.fromDigest(CID.CODEC_DCBOR, new Uint8Array(32).fill(9)));
	const chunks: Uint8Array[] = [serializeCarHeader([root])];

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

		chunks.push(serializeCarEntry(cid.bytes, payload));
	}

	return joinChunks(chunks);
};

// feeds the whole archive as a single chunk: every block body is contiguous
const wholeStream = (bytes: Uint8Array): ReadableStream<Uint8Array> =>
	new ReadableStream({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		},
	});

// feeds the archive in fixed-size chunks, the way a network/file stream would
const chunkedStream = (bytes: Uint8Array, size: number): ReadableStream<Uint8Array> =>
	new ReadableStream({
		start(controller) {
			for (let i = 0; i < bytes.length; i += size) {
				controller.enqueue(bytes.subarray(i, i + size));
			}

			controller.close();
		},
	});

const consume = async (stream: ReadableStream<Uint8Array>): Promise<number> => {
	let sum = 0;
	for await (const entry of fromStream(stream)) {
		sum += entry.bytes.length;
		sum += entry.cid.bytes[35]!;
	}

	return sum;
};

const synthetic = makeSynthetic(20_000, 128);

summary(() => {
	bench('fromStream synthetic 20k (whole)', async () => {
		return do_not_optimize(await consume(wholeStream(synthetic)));
	});

	bench('fromStream synthetic 20k (64 KiB chunks)', async () => {
		return do_not_optimize(await consume(chunkedStream(synthetic, 64 * 1024)));
	});

	bench('fromStream synthetic 20k (16 KiB chunks)', async () => {
		return do_not_optimize(await consume(chunkedStream(synthetic, 16 * 1024)));
	});
});

await run();
