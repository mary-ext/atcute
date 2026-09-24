import * as CID from '@atcute/cid';

import { describe, expect, it } from 'vitest';

import { CidMap } from './cid-map.ts';

// matching heads produce colliding map keys
const cidOf = (head: number, tail: number, codec: 0x55 | 0x71 = CID.CODEC_DCBOR): CID.Cid => {
	const digest = new Uint8Array(32);
	digest.fill(head, 0, 4);
	digest[31] = tail;

	return CID.fromDigest(codec, digest);
};

describe('CidMap', () => {
	it('stores and retrieves values', () => {
		const map = new CidMap<string>();
		const a = cidOf(1, 1);
		const b = cidOf(2, 1);

		map.set(a.bytes, 'a');
		map.set(b.bytes, 'b');

		expect(map.get(a.bytes)).toBe('a');
		expect(map.get(b.bytes)).toBe('b');
		expect(map.get(cidOf(3, 1).bytes)).toBeUndefined();
	});

	it('distinguishes CIDs that share a key', () => {
		const map = new CidMap<string>();
		const a = cidOf(1, 1);
		const b = cidOf(1, 2);
		const c = cidOf(1, 3);

		map.set(a.bytes, 'a');
		// compare the full CID even before a collision is stored
		expect(map.get(b.bytes)).toBeUndefined();

		map.set(b.bytes, 'b');
		map.set(c.bytes, 'c');

		expect(map.get(a.bytes)).toBe('a');
		expect(map.get(b.bytes)).toBe('b');
		expect(map.get(c.bytes)).toBe('c');
		expect(map.get(cidOf(1, 4).bytes)).toBeUndefined();
	});

	it('distinguishes codecs over the same digest', () => {
		const map = new CidMap<string>();
		const cbor = cidOf(1, 1, CID.CODEC_DCBOR);
		const raw = cidOf(1, 1, CID.CODEC_RAW);

		map.set(cbor.bytes, 'cbor');
		expect(map.get(raw.bytes)).toBeUndefined();

		map.set(raw.bytes, 'raw');
		expect(map.get(cbor.bytes)).toBe('cbor');
		expect(map.get(raw.bytes)).toBe('raw');
	});

	it('overwrites the value for the same CID', () => {
		const map = new CidMap<string>();
		const a = cidOf(1, 1);
		const b = cidOf(1, 2);

		map.set(a.bytes, 'first');
		map.set(a.bytes, 'second');
		expect(map.get(a.bytes)).toBe('second');

		// overwrite after a collision
		map.set(b.bytes, 'b');
		map.set(a.bytes, 'third');
		expect(map.get(a.bytes)).toBe('third');
		expect([...map.entries()]).toHaveLength(2);
	});

	it('deletes values, including from collided slots', () => {
		const map = new CidMap<string>();
		const a = cidOf(1, 1);
		const b = cidOf(1, 2);
		const c = cidOf(2, 1);

		map.set(c.bytes, 'c');
		// a colliding CID must not delete the stored entry
		map.delete(cidOf(2, 2).bytes);
		expect(map.get(c.bytes)).toBe('c');

		map.delete(c.bytes);
		expect(map.get(c.bytes)).toBeUndefined();

		map.set(a.bytes, 'a');
		map.set(b.bytes, 'b');
		map.delete(a.bytes);

		expect(map.get(a.bytes)).toBeUndefined();
		expect(map.get(b.bytes)).toBe('b');
	});

	it('lists entries by CID string', () => {
		const map = new CidMap<string>();
		const a = cidOf(1, 1);
		const b = cidOf(1, 2);
		const c = cidOf(2, 1);

		map.set(a.bytes, 'a');
		map.set(b.bytes, 'b');
		map.set(c.bytes, 'c');

		expect(new Map(map.entries())).toEqual(
			new Map([
				[CID.toString(a), 'a'],
				[CID.toString(b), 'b'],
				[CID.toString(c), 'c'],
			]),
		);
	});
});
