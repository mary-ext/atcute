import * as CID from '@atcute/cid';
import { concat } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { fromUint8Array } from './reader.ts';
import { fromStream } from './streamed-reader.ts';
import { serializeCarHeader } from './writer.ts';

const validHeader = (): Uint8Array => {
	const root = CID.toCidLink(CID.fromDigest(CID.CODEC_DCBOR, new Uint8Array(32)));
	return serializeCarHeader([root]);
};

const streamOf = (buffer: Uint8Array<ArrayBuffer>): ReadableStream<Uint8Array> => new Blob([buffer]).stream();

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
