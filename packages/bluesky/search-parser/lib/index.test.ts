import * as fc from 'fast-check';
import { expect, it } from 'vitest';

import { type Token, tokenize } from './index.ts';

it('tokenizes search queries', () => {
	expect(tokenize(`hello world`)).toEqual([
		{ type: 'word', value: 'hello' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'world' },
	]);

	expect(tokenize(`hello   world`)).toEqual([
		{ type: 'word', value: 'hello' },
		{ type: 'whitespace', value: '   ' },
		{ type: 'word', value: 'world' },
	]);

	expect(tokenize(`hello world    `)).toEqual([
		{ type: 'word', value: 'hello' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'world' },
		{ type: 'whitespace', value: '    ' },
	]);

	expect(tokenize(`foo "bar buzz" qux`)).toEqual([
		{ type: 'word', value: 'foo' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'quoted', value: `"bar buzz"` },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'qux' },
	]);

	expect(tokenize(`foo"hello world`)).toEqual([{ type: 'word', value: 'foo"hello world' }]);

	expect(tokenize(`hello world"hello world" hello`)).toEqual([
		{ type: 'word', value: 'hello' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'world"hello world"' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'hello' },
	]);

	expect(tokenize(`foo  "bar""buzz" qux`)).toEqual([
		{ type: 'word', value: 'foo' },
		{ type: 'whitespace', value: '  ' },
		{ type: 'quoted', value: `"bar""buzz"` },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'qux' },
	]);

	expect(tokenize(`foo """"123"""345"" quz`)).toEqual([
		{ type: 'word', value: 'foo' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'quoted', value: '""""123"""345"" quz' },
	]);

	expect(tokenize(` foo "hello world `)).toEqual([
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'foo' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'quoted', value: `"hello world ` },
	]);

	expect(tokenize(`"bar buzz"`)).toEqual([{ type: 'quoted', value: '"bar buzz"' }]);

	expect(tokenize(`"foo bar`)).toEqual([{ type: 'quoted', value: '"foo bar' }]);

	expect(tokenize(`""foo"""bar`)).toEqual([{ type: 'quoted', value: `""foo"""bar` }]);

	expect(tokenize(`""foo bar"""bar buzz`)).toEqual([
		{ type: 'quoted', value: '""foo' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'bar"""bar buzz' },
	]);

	expect(tokenize(`from:"asd"qwe"zxc asd`)).toEqual([{ type: 'word', value: 'from:"asd"qwe"zxc asd' }]);

	expect(tokenize(`"      ""  qwe`)).toEqual([{ type: 'quoted', value: '"      ""  qwe' }]);

	expect(tokenize(`foo"      ""  qwe`)).toEqual([{ type: 'word', value: 'foo"      ""  qwe' }]);
});

it('tokenizes negations', () => {
	expect(tokenize(`foo -bar`)).toEqual([
		{ type: 'word', value: 'foo' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'negation', value: '-' },
		{ type: 'word', value: 'bar' },
	]);

	expect(tokenize(`-"foo bar" baz`)).toEqual([
		{ type: 'negation', value: '-' },
		{ type: 'quoted', value: '"foo bar"' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'baz' },
	]);

	expect(tokenize(`-from:me`)).toEqual([
		{ type: 'negation', value: '-' },
		{ type: 'word', value: 'from:me' },
	]);

	expect(tokenize(`--foo`)).toEqual([
		{ type: 'negation', value: '-' },
		{ type: 'word', value: '-foo' },
	]);

	expect(tokenize(`foo-bar`)).toEqual([{ type: 'word', value: 'foo-bar' }]);

	expect(tokenize(`foo - bar -`)).toEqual([
		{ type: 'word', value: 'foo' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: '-' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'bar' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: '-' },
	]);

	expect(tokenize(`"foo -bar"`)).toEqual([{ type: 'quoted', value: '"foo -bar"' }]);
});

it('should match fieldsfunc implementation', () => {
	// oxlint-disable-next-line unicorn/consistent-function-scoping -- test helper
	const fieldsfunc = (str: string, fn: (rune: number) => boolean): string[] => {
		const slices: string[] = [];

		let start = 0;
		let prev = false;

		for (let idx = 0, len = str.length; idx <= len; idx++) {
			const next: boolean = idx < len ? fn(str.charCodeAt(idx)) : !prev;

			if (idx === 0) {
				prev = next;
				continue;
			}

			if (next !== prev) {
				slices.push(str.slice(start, idx));
				start = idx;
				prev = next;
			}
		}

		return slices;
	};

	const fieldsfunc_tokenize = (query: string): Token[] => {
		// https://github.com/bluesky-social/indigo/blob/421e4da5307f4fcba51f25b5c5982c8b9841f7f6/search/parse_query.go#L15-L21
		let quoted = false;

		const slices = fieldsfunc(query, (rune) => {
			if (rune === 34) {
				quoted = !quoted;
			}

			return rune === 32 && !quoted;
		});

		return slices.flatMap((str): Token[] => {
			if (str.charCodeAt(0) === 32) {
				return [{ type: 'whitespace', value: str }];
			}

			const tokens: Token[] = [];

			if (str.length > 1 && str.charCodeAt(0) === 45) {
				tokens.push({ type: 'negation', value: '-' });
				str = str.slice(1);
			}

			if (str.charCodeAt(0) === 34) {
				tokens.push({ type: 'quoted', value: str });
			} else {
				tokens.push({ type: 'word', value: str });
			}

			return tokens;
		});
	};

	fc.assert(
		fc.property(fc.string({ unit: fc.constantFrom('"', '-', 'a', ' ') }), (str) => {
			expect(tokenize(str)).toEqual(fieldsfunc_tokenize(str));
		}),
	);
});
