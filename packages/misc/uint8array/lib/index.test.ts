import { describe, expect, it } from 'vitest';

import * as node from './index.node.ts';
import { decodeUtf8From as decodeUtf8FromNode } from './index.node.ts';
import * as portable from './index.ts';
import { decodeUtf8From, getUtf8Length, isUtf8LengthInRange } from './index.ts';

const encoder = new TextEncoder();

const inputs = [
	{ label: 'ascii', text: 'hello world' },
	{ label: 'empty', text: '' },
	{ label: 'two-byte', text: 'café' },
	{ label: 'three-byte', text: '你好' },
	{ label: 'surrogate pair', text: '\u{1F600}' },
	{ label: 'ascii fast-path remainder', text: 'abcdeé' },
	{ label: 'lone high surrogate', text: '\uD800' },
	{ label: 'lone low surrogate', text: '\uDC00' },
	{ label: 'two lone high surrogates', text: '\uD800\uD800' },
	{ label: 'lone high surrogate then ascii', text: '\uD800X' },
	{ label: 'lone high surrogate then pair', text: '\uD800\u{1F600}' },
	{ label: 'lone high surrogate then two-byte', text: '\uD800é' },
	{ label: 'ascii around lone high surrogate', text: 'a\uD800b' },
	{ label: 'reversed pair', text: '\uDC00\uD800' },
];

it('getUtf8Length', () => {
	for (const { label, text } of inputs) {
		expect(getUtf8Length(text), label).toBe(encoder.encode(text).length);
	}
});

it('isUtf8LengthInRange', () => {
	for (const { label, text } of inputs) {
		const length = encoder.encode(text).length;

		expect(isUtf8LengthInRange(text, length, length), label).toBe(true);
		expect(isUtf8LengthInRange(text, 0, length), label).toBe(true);
		expect(isUtf8LengthInRange(text, length + 1, length + 4), label).toBe(false);

		if (length > 0) {
			expect(isUtf8LengthInRange(text, 0, length - 1), label).toBe(false);
		}
	}
});

// the bun entrypoint can't be imported here; it shares node's `utf8Slice` fallback
const entrypoints = [
	{ label: 'node', decode: decodeUtf8FromNode },
	{ label: 'portable', decode: decodeUtf8From },
];

const wellFormed = [
	{ label: 'ascii', bytes: [0x68, 0x69], text: 'hi' },
	{ label: 'empty', bytes: [], text: '' },
	{ label: 'largest scalar value', bytes: [0xf4, 0x8f, 0xbf, 0xbf], text: '\u{10ffff}' },
	// a stripped BOM would let two distinct byte sequences decode to the same string
	{ label: 'leading byte order mark', bytes: [0xef, 0xbb, 0xbf, 0x61], text: '﻿a' },
	{ label: 'replacement character', bytes: [0xef, 0xbf, 0xbd], text: '�' },
	// long enough to fall past the unrolled ascii fast path on every entrypoint
	{ label: 'run of ascii', bytes: Array(40).fill(0x61), text: 'a'.repeat(40) },
];

const malformed = [
	{ label: 'bare continuation byte', bytes: [0x80] },
	{ label: 'continuation byte out of place', bytes: [0xe4, 0xbd, 0x20] },
	{ label: 'five-byte sequence', bytes: [0xf8, 0x88, 0x80, 0x80, 0x80] },
	{ label: 'invalid byte after ascii', bytes: [0x61, 0xff] },
	{ label: 'invalid byte past the ascii fast path', bytes: [...Array(40).fill(0x61), 0xff] },
	{ label: 'lone high surrogate', bytes: [0xed, 0xa0, 0x80] },
	{ label: 'lone low surrogate', bytes: [0xed, 0xb0, 0x80] },
	{ label: 'overlong nul', bytes: [0xc0, 0x80] },
	{ label: 'overlong solidus', bytes: [0xc0, 0xaf] },
	{ label: 'past the largest scalar value', bytes: [0xf4, 0x90, 0x80, 0x80] },
	{ label: 'truncated four-byte sequence', bytes: [0xf0, 0x9f, 0x98] },
	{ label: 'truncated three-byte sequence', bytes: [0xe4, 0xbd] },
	{ label: 'truncated two-byte sequence', bytes: [0xc3] },
];

for (const { label: runtime, decode } of entrypoints) {
	describe(runtime, () => {
		it('decodes well-formed input', () => {
			for (const { label, bytes, text } of wellFormed) {
				expect(decode(Uint8Array.from(bytes), 0, bytes.length), label).toBe(text);
			}
		});

		it('rejects malformed input', () => {
			for (const { label, bytes } of malformed) {
				expect(() => decode(Uint8Array.from(bytes), 0, bytes.length), label).toThrow(TypeError);
			}
		});

		it('decodes and validates only the requested range', () => {
			const buffer = Uint8Array.from([0xff, 0x61, 0x62, 0xff]);

			expect(decode(buffer, 1, 2)).toBe('ab');
			expect(() => decode(buffer, 0, 3)).toThrow(TypeError);
		});

		it('defaults length to the remainder after offset', () => {
			const buffer = Uint8Array.from([0x61, 0x62, 0x63]);

			expect(decode(buffer, 1)).toBe('bc');
			expect(decode(buffer, 3)).toBe('');
		});
	});
}

// these three used to disagree across entrypoints; the bun build is checked separately, it shares
// node's `Buffer` primitives for `compare`/`timingSafeEquals`
const impls = [
	{ label: 'node', impl: node },
	{ label: 'portable', impl: portable },
];

const bytes = (...values: number[]) => Uint8Array.from(values);

for (const { label: runtime, impl } of impls) {
	describe(runtime, () => {
		it('compares bytewise, not by length first', () => {
			// the byte at index 0 decides it, even though `a` is the shorter buffer
			expect(impl.compare(bytes(2), bytes(1, 255))).toBe(1);
			expect(impl.compare(bytes(1, 255), bytes(2))).toBe(-1);

			// a prefix sorts before the buffer extending it
			expect(impl.compare(bytes(1), bytes(1, 0))).toBe(-1);
			expect(impl.compare(bytes(1, 0), bytes(1))).toBe(1);

			expect(impl.compare(bytes(), bytes(0))).toBe(-1);
			expect(impl.compare(bytes(1, 2), bytes(1, 2))).toBe(0);
			expect(impl.compare(bytes(), bytes())).toBe(0);
		});

		it('sorts bytewise as a comparator', () => {
			const sorted = [bytes(2), bytes(1, 255), bytes(1), bytes()].toSorted(impl.compare);

			expect(sorted).toEqual([bytes(), bytes(1), bytes(1, 255), bytes(2)]);
		});

		it('compares timing-safely, returning false on a length mismatch', () => {
			expect(impl.timingSafeEquals(bytes(1), bytes(1, 2))).toBe(false);
			expect(impl.timingSafeEquals(bytes(1, 2), bytes(1))).toBe(false);
			expect(impl.timingSafeEquals(bytes(), bytes(1))).toBe(false);

			expect(impl.timingSafeEquals(bytes(1, 2), bytes(1, 3))).toBe(false);
			expect(impl.timingSafeEquals(bytes(1, 2), bytes(1, 2))).toBe(true);
			expect(impl.timingSafeEquals(bytes(), bytes())).toBe(true);
		});

		it('concatenates to the combined length by default', () => {
			expect(impl.concat([bytes(1, 2), bytes(3, 4)])).toEqual(bytes(1, 2, 3, 4));
			expect(impl.concat([])).toEqual(bytes());
		});

		it('concatenates to exactly the requested size', () => {
			expect(impl.concat([bytes(1, 2), bytes(3, 4)], 4)).toEqual(bytes(1, 2, 3, 4));

			// overflowing contents are truncated, mid-chunk if need be
			expect(impl.concat([bytes(1, 2), bytes(3, 4)], 3)).toEqual(bytes(1, 2, 3));
			expect(impl.concat([bytes(1, 2), bytes(3, 4)], 2)).toEqual(bytes(1, 2));
			expect(impl.concat([bytes(1, 2), bytes(3, 4)], 0)).toEqual(bytes());

			// an underfilled result is zeroed out to the requested size
			expect(impl.concat([bytes(1, 2)], 4)).toEqual(bytes(1, 2, 0, 0));
			expect(impl.concat([], 2)).toEqual(bytes(0, 0));
		});
	});
}
