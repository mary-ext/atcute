import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
	getGraphemeLength as getGraphemeLengthNode,
	hasNative,
	isGraphemeLengthInRange as isGraphemeLengthInRangeNode,
} from './index.node.ts';
import { getGraphemeLength, isGraphemeLengthInRange } from './index.ts';

// the native binding copies into a 4096-unit stack buffer and only heap-allocates beyond that, so
// these cover both sides of that boundary. non-ASCII keeps the JS wrapper from short-circuiting
// before the native call, and BMP (1 unit) vs astral (2 units) graphemes exercise both buffer paths.
const STACK_BUF_MAX = 4096;

const inputs = [
	{ label: 'ascii', text: 'hello world', expected: 11 },
	{ label: 'empty', text: '', expected: 0 },
	{ label: 'emoji', text: 'hello \u{1F600} world', expected: 13 },
	{ label: 'ZWJ family', text: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}', expected: 1 },
	{ label: 'flags', text: '\u{1F1FA}\u{1F1F8}', expected: 1 },
	{ label: 'combining', text: 'e\u0301', expected: 1 },
	{ label: 'CRLF', text: 'a\r\nb', expected: 3 },
	{ label: 'hangul', text: '\uAC00\uB098\uB2E4', expected: 3 },
	{ label: 'hangul run', text: '\uD55C'.repeat(10), expected: 10 },
	{ label: 'hangul LV + V jamo', text: '\uAC00\u1161', expected: 1 },
	{ label: 'hangul LVT + T jamo', text: '\uAC01\u11A8', expected: 1 },
	{ label: 'hangul syllable + combining', text: '\uAC00\u0301', expected: 1 },
	{ label: 'hangul split by ascii', text: '\uAC00a\uB098', expected: 3 },
	{ label: 'stack boundary -1', text: '\u3042'.repeat(STACK_BUF_MAX - 1), expected: STACK_BUF_MAX - 1 },
	{ label: 'stack boundary', text: '\u3042'.repeat(STACK_BUF_MAX), expected: STACK_BUF_MAX },
	{ label: 'stack boundary +1', text: '\u3042'.repeat(STACK_BUF_MAX + 1), expected: STACK_BUF_MAX + 1 },
	{ label: 'long bmp (heap)', text: '\u3042'.repeat(5000), expected: 5000 },
	{ label: 'long astral (heap)', text: '\u{1F600}'.repeat(5000), expected: 5000 },
];

it('getGraphemeLength', () => {
	for (const { text, expected } of inputs) {
		expect(getGraphemeLength(text)).toBe(expected);
	}
});

it('isGraphemeLengthInRange', () => {
	expect(isGraphemeLengthInRange('hello', 0, 10)).toBe(true);
	expect(isGraphemeLengthInRange('hello', 0, 4)).toBe(false);
	expect(isGraphemeLengthInRange('hello', 6, 10)).toBe(false);
	expect(isGraphemeLengthInRange('\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', 0, 1)).toBe(true);
});

describe.skipIf(!hasNative)('native', () => {
	it('getGraphemeLength', () => {
		for (const { text, expected } of inputs) {
			expect(getGraphemeLengthNode(text)).toBe(expected);
		}
	});

	it('isGraphemeLengthInRange', () => {
		expect(isGraphemeLengthInRangeNode('hello', 0, 10)).toBe(true);
		expect(isGraphemeLengthInRangeNode('hello', 0, 4)).toBe(false);
		expect(isGraphemeLengthInRangeNode('hello', 6, 10)).toBe(false);
		expect(isGraphemeLengthInRangeNode('\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', 0, 1)).toBe(true);

		// long strings exercise the native heap path past the 4096-unit stack buffer; non-ASCII and a
		// non-trivial min/max keep the JS wrapper from short-circuiting before the native call
		const longBmp = '\u3042'.repeat(5000); // 5000 graphemes across 5000 utf16 units
		expect(isGraphemeLengthInRangeNode(longBmp, 0, 300)).toBe(false);
		expect(isGraphemeLengthInRangeNode(longBmp, 0, 4999)).toBe(false);
		expect(isGraphemeLengthInRangeNode(longBmp, 5000, 5000)).toBe(true);
		expect(isGraphemeLengthInRangeNode('\u{1F600}'.repeat(5000), 0, 300)).toBe(false);

		// an overflowing string that is a single cluster must not be rejected from its prefix
		const giantCluster = 'a' + '́'.repeat(5000); // 1 grapheme across 5001 utf16 units
		expect(isGraphemeLengthInRangeNode(giantCluster, 0, 1)).toBe(true);
		expect(isGraphemeLengthInRangeNode(giantCluster, 1, 1)).toBe(true);

		// a surrogate pair split at the 4096-unit prefix boundary must not over-count and reject:
		// 4092 ASCII + wave + skin-tone modifier = 4093 graphemes, the modifier pair straddling it
		const splitBoundary = 'a'.repeat(4092) + '👋🏻';
		expect(isGraphemeLengthInRangeNode(splitBoundary, 4093, 4093)).toBe(true);
		expect(isGraphemeLengthInRangeNode(splitBoundary, 0, 4092)).toBe(false);
	});

	it('getGraphemeLength safely fails on invalid input', () => {
		const getGraphemeLengthNodeAny = getGraphemeLengthNode as any;

		expect(() => getGraphemeLengthNodeAny(1337)).toThrow(TypeError);
		expect(() => getGraphemeLengthNodeAny(new Uint8Array(10))).toThrow(TypeError);
		expect(() => getGraphemeLengthNodeAny(null)).toThrow(TypeError);
		expect(() => getGraphemeLengthNodeAny()).toThrow(TypeError);
	});

	it('isGraphemeLengthInRangeNode safely fails on invalid input', () => {
		const isGraphemeLengthInRangeNodeAny = isGraphemeLengthInRangeNode as any;

		const invalidArg1 = [1337, new Uint8Array(10), null];
		const invalidArg2 = ['wow', new Uint8Array(10), null];
		const invalidArg3 = ['wow', new Uint8Array(10), null];

		for (const arg1 of invalidArg1) {
			for (const arg2 of invalidArg2) {
				for (const arg3 of invalidArg3) {
					expect(() => isGraphemeLengthInRangeNodeAny('wow', 0, arg3)).toThrow(TypeError);
					expect(() => isGraphemeLengthInRangeNodeAny('wow', arg2, arg3)).toThrow(TypeError);
					expect(() => isGraphemeLengthInRangeNodeAny(arg1, 0, arg3)).toThrow(TypeError);
					expect(() => isGraphemeLengthInRangeNodeAny(arg1, arg2, arg3)).toThrow(TypeError);
				}

				expect(() => isGraphemeLengthInRangeNodeAny(arg1, arg2, 4096)).toThrow(TypeError);
				expect(() => isGraphemeLengthInRangeNodeAny(arg1, arg2)).toThrow(TypeError);
			}

			expect(() => isGraphemeLengthInRangeNodeAny(arg1, 0)).toThrow(TypeError);
			expect(() => isGraphemeLengthInRangeNodeAny(arg1)).toThrow(TypeError);
		}

		expect(() => isGraphemeLengthInRangeNodeAny()).toThrow(TypeError);
		expect(() => isGraphemeLengthInRangeNodeAny('wow')).toThrow(TypeError);
		expect(() => isGraphemeLengthInRangeNodeAny('wow', 0)).toThrow(TypeError);
	});
});

// #region Unicode conformance tests (GraphemeBreakTest.txt)

/** parses GraphemeBreakTest.txt into test cases */
const parseGraphemeBreakTest = (path: string): { text: string; clusters: number; line: number }[] => {
	const raw = readFileSync(path, 'utf-8');
	const cases: { text: string; clusters: number; line: number }[] = [];

	for (const [i, line] of raw.split('\n').entries()) {
		const content = line.split('#')[0].trim();
		if (!content) {
			continue;
		}

		// format: ÷ 0020 × 0308 ÷ 0020 ÷
		// ÷ = break, × = no break
		const tokens = content.split(/\s+/);
		let codepoints = '';
		let clusters = 0;

		for (const token of tokens) {
			if (token === '\u00F7') {
				// ÷ = break
				clusters++;
			} else if (token === '\u00D7') {
				// × = no break
			} else {
				// hex codepoint
				codepoints += String.fromCodePoint(parseInt(token, 16));
			}
		}

		// leading ÷ counts as a break but doesn't represent a cluster boundary,
		// trailing ÷ is end-of-text. cluster count = breaks - 1
		cases.push({ text: codepoints, clusters: clusters - 1, line: i + 1 });
	}

	return cases;
};

const conformanceCases = parseGraphemeBreakTest('src/unicode/data/GraphemeBreakTest.txt');

describe('Unicode GraphemeBreakTest conformance (js)', () => {
	it.each(conformanceCases)('line $line', ({ text, clusters }) => {
		expect(getGraphemeLength(text)).toBe(clusters);
	});
});

describe.skipIf(!hasNative)('Unicode GraphemeBreakTest conformance (native)', () => {
	it.each(conformanceCases)('line $line', ({ text, clusters }) => {
		expect(getGraphemeLengthNode(text)).toBe(clusters);
	});
});

// #endregion
