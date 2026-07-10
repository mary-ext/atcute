import { expect, it } from 'vitest';

import { getUtf8Length, isUtf8LengthInRange } from './index.ts';

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
