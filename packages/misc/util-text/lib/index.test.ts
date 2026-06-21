import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { getGraphemeLength, isGraphemeLengthInRange } from './index.ts';

const inputs = [
	{ label: 'ascii', text: 'hello world', expected: 11 },
	{ label: 'empty', text: '', expected: 0 },
	{ label: 'emoji', text: 'hello \u{1F600} world', expected: 13 },
	{ label: 'ZWJ family', text: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}', expected: 1 },
	{ label: 'flags', text: '\u{1F1FA}\u{1F1F8}', expected: 1 },
	{ label: 'combining', text: 'e\u0301', expected: 1 },
	{ label: 'CRLF', text: 'a\r\nb', expected: 3 },
	{ label: 'hangul', text: '\uAC00\uB098\uB2E4', expected: 3 },
	// precomposed latin-1 takes the non-ASCII exact path: each code unit is its own cluster
	{ label: 'latin-1 precomposed', text: 'caf\u00E9 r\u00E9sum\u00E9', expected: 11 },
	{ label: 'latin-1 high', text: '\u00FF\u00C0\u00E9', expected: 3 },
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

	// latin-1 exercises the non-ASCII exact path (no segmentation)
	expect(isGraphemeLengthInRange('caf\u00E9', 4, 4)).toBe(true);
	expect(isGraphemeLengthInRange('caf\u00E9 r\u00E9sum\u00E9', 0, 5)).toBe(false);
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

// #endregion
