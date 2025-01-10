import { expect, it } from 'bun:test';

import { tokenize } from './index.js';

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
		{ type: 'quoted', value: '""""123"""345""' },
		{ type: 'whitespace', value: ' ' },
		{ type: 'word', value: 'quz' },
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

	expect(tokenize(`""foo bar"""bar buzz`)).toEqual([{ type: 'quoted', value: `""foo bar"""bar buzz` }]);
});
