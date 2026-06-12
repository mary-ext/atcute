import * as CID from '@atcute/cid';
import { concat, encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { fromUint8Array } from './reader.ts';
import { fromStream } from './streamed-reader.ts';
import { serializeCarEntry, serializeCarHeader } from './writer.ts';

const validHeader = (): Uint8Array => {
	const root = CID.toCidLink(CID.fromDigest(CID.CODEC_DCBOR, new Uint8Array(32)));
	return serializeCarHeader([root]);
};

const validCar = (): Uint8Array<ArrayBuffer> => {
	const cid = CID.fromDigest(CID.CODEC_RAW, new Uint8Array(32).fill(7));
	const root = CID.toCidLink(cid);
	return concat([serializeCarHeader([root]), serializeCarEntry(cid.bytes, encodeUtf8('hello'))]);
};

const streamOf = (buffer: Uint8Array<ArrayBuffer>): ReadableStream<Uint8Array> => new Blob([buffer]).stream();

const streamOfChunks = (chunks: Uint8Array[]): ReadableStream<Uint8Array> =>
	new ReadableStream({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(chunk);
			}

			controller.close();
		},
	});

describe('block length < 36', () => {
	// a block whose declared length is below the 36-byte cid size is malformed; the spec
	// requires rejecting it before attempting to read the cid (which would otherwise read
	// past the entry boundary into the following bytes)
	const malformed = concat([Uint8Array.of(5), new Uint8Array(40)]);
	const buffer = concat([validHeader(), malformed]);

	it('is rejected by the sync reader', () => {
		expect(() => Array.from(fromUint8Array(buffer))).toThrowError(/invalid car block/);
	});

	it('is rejected by the streaming reader', async () => {
		await expect(Array.fromAsync(fromStream(streamOf(buffer)))).rejects.toThrowError(/invalid car block/);
	});
});

describe('empty chunks', () => {
	// a readable stream may legally emit zero-length chunks; the reader must skip them
	// instead of mistaking the absent byte for a varint terminator
	const car = validCar();

	it('are skipped before the header', async () => {
		const stream = streamOfChunks([new Uint8Array(0), car]);
		const reader = fromStream(stream);

		const header = await reader.header();
		expect(header.data.roots).toHaveLength(1);

		const entries = await Array.fromAsync(reader);
		expect(entries).toHaveLength(1);
	});

	it('are skipped between and after blocks', async () => {
		const header = validHeader();
		const cid = CID.fromDigest(CID.CODEC_RAW, new Uint8Array(32).fill(7));
		const entry = serializeCarEntry(cid.bytes, encodeUtf8('hello'));

		const stream = streamOfChunks([header, new Uint8Array(0), entry, new Uint8Array(0)]);
		const entries = await Array.fromAsync(fromStream(stream));

		expect(entries).toHaveLength(1);
	});
});

describe('sync reader iteration', () => {
	// the reader is an iterable, not a one-shot iterator; iterating it again must replay
	// from the first block rather than resume from where the previous pass stopped
	it('replays entries on each iteration', () => {
		const reader = fromUint8Array(validCar());

		const first = Array.from(reader);
		const second = Array.from(reader);

		expect(first).toHaveLength(1);
		expect(second).toEqual(first);
	});
});
