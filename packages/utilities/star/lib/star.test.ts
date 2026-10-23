import * as CBOR from '@atcute/cbor';
import { concat, encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { STAR_MAGIC } from './constants.ts';
import { fromUint8Array } from './reader.ts';
import { fromStream, starEntryTransform } from './streamed-reader.ts';
import type { StarMeta, StarPair, StarReaderOptions } from './types.ts';
import { serializeStarEntry, serializeStarHeader, writeStarStream } from './writer.ts';

const META: StarMeta = { $type: 'test', n: 1 };

const PAIRS: StarPair[] = [
	{ key: encodeUtf8('app.bsky.feed.post/3kaaa'), value: CBOR.encode({ text: 'hello' }) },
	{ key: new Uint8Array(0), value: new Uint8Array(0) },
	// a value long enough to need a two-byte length
	{ key: Uint8Array.of(1), value: new Uint8Array(300).fill(7) },
];

const collect = async (stream: AsyncIterable<Uint8Array>): Promise<Uint8Array> => {
	const chunks: Uint8Array[] = [];
	for await (const chunk of stream) {
		chunks.push(chunk);
	}

	return concat(chunks);
};

// interleave empty chunks to exercise reader refills
const toStream = (buf: Uint8Array, size: number): ReadableStream<Uint8Array> => {
	let pos = 0;
	let empty = false;

	return new ReadableStream({
		pull(controller) {
			if (pos >= buf.length) {
				controller.close();
				return;
			}

			if ((empty = !empty)) {
				controller.enqueue(new Uint8Array(0));
				return;
			}

			controller.enqueue(buf.slice(pos, (pos += size)));
		},
	});
};

const readSync = (buf: Uint8Array, options?: StarReaderOptions) => {
	const star = fromUint8Array(buf, options);
	return { meta: star.meta, pairs: Array.from(star, ({ key, value }) => ({ key, value })) };
};

const readStreamed = async (buf: Uint8Array, chunkSize: number, options?: StarReaderOptions) => {
	await using star = fromStream(toStream(buf, chunkSize), options);

	const meta = await star.meta();
	const pairs: StarPair[] = [];
	for await (const { key, value } of star) {
		pairs.push({ key, value });
	}

	return { meta, pairs };
};

const readBoth = async (buf: Uint8Array, options?: StarReaderOptions) => {
	const sync = readSync(buf, options);

	for (const chunkSize of [1, 3, buf.length || 1]) {
		expect(await readStreamed(buf, chunkSize, options)).toEqual(sync);
	}

	return sync;
};

const expectBothReject = async (buf: Uint8Array, message: RegExp, options?: StarReaderOptions) => {
	expect(() => readSync(buf, options)).toThrow(message);
	await expect(readStreamed(buf, 1, options)).rejects.toThrow(message);
	await expect(readStreamed(buf, buf.length || 1, options)).rejects.toThrow(message);
};

const header = (meta: Uint8Array, length: Uint8Array = Uint8Array.of(meta.length)): Uint8Array => {
	return concat([STAR_MAGIC, length, meta]);
};

describe('writer', () => {
	it('serializes the header', () => {
		const meta = CBOR.encode({ $type: 'test' });

		expect(serializeStarHeader({ $type: 'test' })).toEqual(header(meta));
	});

	it('serializes entries', () => {
		expect(serializeStarEntry(Uint8Array.of(1, 2), Uint8Array.of(3))).toEqual(Uint8Array.of(2, 1, 2, 1, 3));
		expect(serializeStarEntry(new Uint8Array(0), new Uint8Array(0))).toEqual(Uint8Array.of(0, 0));

		const entry = serializeStarEntry(new Uint8Array(0), new Uint8Array(128));
		expect(entry.subarray(0, 3)).toEqual(Uint8Array.of(0, 0x80, 0x01));
		expect(entry.length).toBe(3 + 128);
	});

	it('rejects metadata without a $type', () => {
		// @ts-expect-error testing runtime validation
		expect(() => serializeStarHeader({ $type: 1 })).toThrow(/must be a map with a \$type/);
	});

	it('streams the header followed by entries', async () => {
		const buf = await collect(writeStarStream(META, PAIRS));

		expect(buf).toEqual(
			concat([serializeStarHeader(META), ...PAIRS.map(({ key, value }) => serializeStarEntry(key, value))]),
		);
	});
});

describe('reader', () => {
	it('round-trips metadata and pairs', async () => {
		const buf = await collect(writeStarStream(META, PAIRS));

		expect(await readBoth(buf)).toEqual({ meta: META, pairs: PAIRS });
	});

	it('reads an archive without pairs', async () => {
		const buf = serializeStarHeader({ $type: 'test' });

		expect(await readBoth(buf)).toEqual({ meta: { $type: 'test' }, pairs: [] });
	});

	it('reports offsets', async () => {
		const buf = await collect(writeStarStream(META, PAIRS));
		const headerSize = serializeStarHeader(META).length;

		const star = fromUint8Array(buf);
		expect(star.header).toEqual({
			data: META,
			headerStart: 0,
			headerEnd: headerSize,
			dataStart: 5,
			dataEnd: headerSize,
		});

		const entries = Array.from(star);
		expect(entries.at(-1)!.entryEnd).toBe(buf.length);

		for (const entry of entries) {
			expect(buf.subarray(entry.keyStart, entry.keyEnd)).toEqual(entry.key);
			expect(buf.subarray(entry.valueStart, entry.valueEnd)).toEqual(entry.value);
		}

		await using streamed = fromStream(toStream(buf, 7));
		expect(await streamed.header()).toEqual(star.header);
		expect(await Array.fromAsync(streamed)).toEqual(entries);
	});

	it('works as a transform stream', async () => {
		const buf = await collect(writeStarStream(META, PAIRS));

		const entries = await Array.fromAsync(toStream(buf, 5).pipeThrough(starEntryTransform()));
		expect(entries.map(({ key, value }) => ({ key, value }))).toEqual(PAIRS);
	});

	it('rejects the wrong magic bytes', async () => {
		const buf = serializeStarHeader({ $type: 'test' });
		buf[0] = 0x3a;

		await expectBothReject(buf, /expected a star v1 archive/);
	});

	it('rejects a CAR archive', async () => {
		// CAR archives start with a header length followed by a CBOR map
		await expectBothReject(Uint8Array.of(0x3a, 0xa2, 0x65, 0x72, 0x6f, 0x6f), /expected a star v1 archive/);
	});

	it('rejects truncated magic bytes', async () => {
		await expectBothReject(new Uint8Array(0), /unexpected end of data/);
		await expectBothReject(STAR_MAGIC.subarray(0, 2), /unexpected end of data/);
	});

	it('rejects missing metadata', async () => {
		await expectBothReject(STAR_MAGIC, /unexpected end of data/);
	});

	it('rejects an overlong varint', async () => {
		await expectBothReject(header(new Uint8Array(0), new Uint8Array(7).fill(0x80)), /varint too long/);
	});

	it('rejects oversized metadata before reading it', async () => {
		// 2^26 + 1, one past 64 MiB
		await expectBothReject(header(new Uint8Array(0), Uint8Array.of(0x81, 0x80, 0x80, 0x20)), /exceeds limit/);
	});

	it('rejects non-canonical metadata', async () => {
		// {"$type":"t","a":1} with its keys out of canonical (length-first) order
		const meta = concat([
			Uint8Array.of(0xa2, 0x65),
			encodeUtf8('$type'),
			Uint8Array.of(0x61, 0x74, 0x61, 0x61, 0x01),
		]);

		await expectBothReject(header(meta), /canonical order/);
	});

	it('rejects empty metadata', async () => {
		await expectBothReject(header(new Uint8Array(0)), /unexpected end of input/);
	});

	it('rejects metadata without a $type', async () => {
		await expectBothReject(header(CBOR.encode({ a: 1 })), /must be a map with a \$type/);
		await expectBothReject(header(CBOR.encode({ $type: 1 })), /must be a map with a \$type/);
		await expectBothReject(header(CBOR.encode(['test'])), /must be a map with a \$type/);
	});

	it('rejects trailing bytes after the metadata item', async () => {
		const meta = concat([CBOR.encode({ $type: 'test' }), Uint8Array.of(0)]);

		await expectBothReject(header(meta), /remainder/);
	});

	it('rejects EOF inside a pair', async () => {
		const base = serializeStarHeader({ $type: 'test' });

		// missing value
		await expectBothReject(concat([base, Uint8Array.of(1, 1)]), /unexpected end of data/);
		// truncated key
		await expectBothReject(concat([base, Uint8Array.of(2, 1)]), /unexpected end of data/);
		// truncated value
		await expectBothReject(concat([base, Uint8Array.of(0, 2, 1)]), /unexpected end of data/);
		// truncated varint
		await expectBothReject(concat([base, Uint8Array.of(0x80)]), /unexpected end of data/);
	});

	it('rejects overlong pair lengths', async () => {
		const base = serializeStarHeader({ $type: 'test' });

		await expectBothReject(concat([base, new Uint8Array(7).fill(0x80)]), /varint too long/);
	});

	it('enforces profile limits', async () => {
		const buf = await collect(writeStarStream(META, PAIRS));

		await expectBothReject(buf, /exceeds limit; length=300 limit=299/, { maxValueLength: 299 });
		await expectBothReject(buf, /exceeds limit; length=24 limit=23/, { maxKeyLength: 23 });

		expect(await readBoth(buf, { maxKeyLength: 24, maxValueLength: 300 })).toEqual({
			meta: META,
			pairs: PAIRS,
		});
	});

	it('never lifts STAR limits', async () => {
		// 2^26 + 1, one past 64 MiB
		const buf = concat([serializeStarHeader({ $type: 'test' }), Uint8Array.of(0x81, 0x80, 0x80, 0x20)]);

		await expectBothReject(buf, /limit=67108864/, { maxKeyLength: Infinity });
		await expectBothReject(buf, /limit=67108864/, { maxKeyLength: NaN });
	});

	it('cancels the source when the transform fails', async () => {
		let cancelled = false;
		const source = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(Uint8Array.of(0, 0, 0, 0));
			},
			cancel() {
				cancelled = true;
			},
		});

		const piping = source.pipeThrough(starEntryTransform());

		await expect(Array.fromAsync(piping)).rejects.toThrow(/expected a star v1 archive/);
		expect(cancelled).toBe(true);
	});
});
