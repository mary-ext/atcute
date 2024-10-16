import { expect, it } from 'bun:test';

import { tokenize } from './index.js';

it('plain', () => {
	expect(tokenize('hello world')).toEqual([
		{
			type: 'text',
			raw: 'hello world',
			text: 'hello world',
		},
	]);
});

it('escapes', () => {
	expect(tokenize('\\@bsky.app')).toEqual([
		{
			type: 'escape',
			raw: '\\@',
			escaped: '@',
		},
		{
			type: 'text',
			raw: 'bsky.app',
			text: 'bsky.app',
		},
	]);

	expect(tokenize('\\h')).toEqual([
		{
			type: 'text',
			raw: '\\h',
			text: '\\h',
		},
	]);

	expect(tokenize('\\')).toEqual([
		{
			type: 'text',
			raw: '\\',
			text: '\\',
		},
	]);
});

it('mentions', () => {
	expect(tokenize('@bsky.app')).toEqual([
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
	]);

	expect(tokenize('hello@bsky.app')).toEqual([
		{
			type: 'text',
			raw: 'hello@bsky.app',
			text: 'hello@bsky.app',
		},
	]);

	expect(tokenize('hello(@bsky.app')).toEqual([
		{
			type: 'text',
			raw: 'hello(',
			text: 'hello(',
		},
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
	]);

	expect(tokenize('@bsky.app.')).toEqual([
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
		{
			type: 'text',
			raw: '.',
			text: '.',
		},
	]);

	expect(tokenize('@bsky.app@')).toEqual([
		{
			type: 'text',
			raw: '@bsky.app@',
			text: '@bsky.app@',
		},
	]);

	expect(tokenize('@@bsky.app')).toEqual([
		{
			raw: '@@bsky.app',
			text: '@@bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('@@@bsky.app')).toEqual([
		{
			type: 'text',
			raw: '@@@bsky.app',
			text: '@@@bsky.app',
		},
	]);

	expect(tokenize('@(@bsky.app')).toEqual([
		{
			type: 'text',
			raw: '@(',
			text: '@(',
		},
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
	]);

	expect(tokenize('@(@@bsky.app')).toEqual([
		{
			type: 'text',
			raw: '@(@@bsky.app',
			text: '@(@@bsky.app',
		},
	]);

	expect(tokenize('hello @bsky.app@')).toEqual([
		{
			type: 'text',
			raw: 'hello @bsky.app@',
			text: 'hello @bsky.app@',
		},
	]);

	expect(tokenize('@bsky.app.@')).toEqual([
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
		{
			type: 'text',
			raw: '.@',
			text: '.@',
		},
	]);

	expect(tokenize('(@bsky.app)')).toEqual([
		{
			type: 'text',
			raw: '(',
			text: '(',
		},
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
		{
			type: 'text',
			raw: ')',
			text: ')',
		},
	]);

	expect(tokenize('@bsky.app hello')).toEqual([
		{
			type: 'mention',
			raw: '@bsky.app',
			handle: 'bsky.app',
		},
		{
			type: 'text',
			raw: ' hello',
			text: ' hello',
		},
	]);

	expect(tokenize('hello @bsky.app hello')).toEqual([
		{
			raw: 'hello ',
			text: 'hello ',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
		{
			raw: ' hello',
			text: ' hello',
			type: 'text',
		},
	]);

	expect(tokenize('hello @bsky.app')).toEqual([
		{
			raw: 'hello ',
			text: 'hello ',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
	]);
});

it('topics', () => {
	expect(tokenize('#cool')).toEqual([
		{
			type: 'topic',
			raw: '#cool',
			name: 'cool',
		},
	]);

	expect(tokenize('#123')).toEqual([
		{
			type: 'text',
			raw: '#123',
			text: '#123',
		},
	]);

	expect(tokenize('#123cool')).toEqual([
		{
			type: 'topic',
			raw: '#123cool',
			name: '123cool',
		},
	]);

	expect(tokenize('#cool123')).toEqual([
		{
			type: 'topic',
			raw: '#cool123',
			name: 'cool123',
		},
	]);

	expect(tokenize('hello#cool')).toEqual([
		{
			type: 'text',
			raw: 'hello#cool',
			text: 'hello#cool',
		},
	]);

	expect(tokenize('hello(#cool')).toEqual([
		{
			type: 'text',
			raw: 'hello(',
			text: 'hello(',
		},
		{
			type: 'topic',
			raw: '#cool',
			name: 'cool',
		},
	]);

	expect(tokenize('#cool.')).toEqual([
		{
			type: 'topic',
			raw: '#cool',
			name: 'cool',
		},
		{
			type: 'text',
			raw: '.',
			text: '.',
		},
	]);

	expect(tokenize('#cool#')).toEqual([
		{
			type: 'text',
			raw: '#cool#',
			text: '#cool#',
		},
	]);

	expect(tokenize('hello #cool#')).toEqual([
		{
			type: 'text',
			raw: 'hello #cool#',
			text: 'hello #cool#',
		},
	]);

	expect(tokenize('#cool.#')).toEqual([
		{
			type: 'topic',
			raw: '#cool',
			name: 'cool',
		},
		{
			type: 'text',
			raw: '.#',
			text: '.#',
		},
	]);

	expect(tokenize('#cool hello')).toEqual([
		{
			type: 'topic',
			raw: '#cool',
			name: 'cool',
		},
		{
			type: 'text',
			raw: ' hello',
			text: ' hello',
		},
	]);

	expect(tokenize('hello #cool hello')).toEqual([
		{
			raw: 'hello ',
			text: 'hello ',
			type: 'text',
		},
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
		{
			raw: ' hello',
			text: ' hello',
			type: 'text',
		},
	]);

	expect(tokenize('hello #cool')).toEqual([
		{
			raw: 'hello ',
			text: 'hello ',
			type: 'text',
		},
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
	]);
});

it('autolinks', () => {
	expect(tokenize('https://example.com')).toEqual([
		{
			type: 'autolink',
			raw: 'https://example.com',
			url: 'https://example.com',
		},
	]);

	expect(tokenize('https://')).toEqual([
		{
			type: 'text',
			raw: 'https://',
			text: 'https://',
		},
	]);

	expect(tokenize('https://example.com/.')).toEqual([
		{
			type: 'autolink',
			raw: 'https://example.com/',
			url: 'https://example.com/',
		},
		{
			type: 'text',
			raw: '.',
			text: '.',
		},
	]);

	expect(tokenize('https://example.com/.)')).toEqual([
		{
			type: 'autolink',
			raw: 'https://example.com/',
			url: 'https://example.com/',
		},
		{
			type: 'text',
			raw: '.)',
			text: '.)',
		},
	]);

	expect(tokenize('https://example.com/.))')).toEqual([
		{
			type: 'autolink',
			raw: 'https://example.com/',
			url: 'https://example.com/',
		},
		{
			type: 'text',
			raw: '.))',
			text: '.))',
		},
	]);

	expect(tokenize('https://foo.com/thing_cool)')).toEqual([
		{
			type: 'autolink',
			raw: 'https://foo.com/thing_cool',
			url: 'https://foo.com/thing_cool',
		},
		{
			type: 'text',
			raw: ')',
			text: ')',
		},
	]);

	expect(tokenize('https://foo.com/thing_(cool)')).toEqual([
		{
			type: 'autolink',
			raw: 'https://foo.com/thing_(cool)',
			url: 'https://foo.com/thing_(cool)',
		},
	]);

	expect(tokenize('abchttps://example.com/')).toEqual([
		{
			type: 'text',
			raw: 'abc',
			text: 'abc',
		},
		{
			type: 'autolink',
			raw: 'https://example.com/',
			url: 'https://example.com/',
		},
	]);
});

it('links', () => {
	expect(tokenize('[abc](https://google.com)')).toEqual([
		{
			type: 'link',
			raw: '[abc](https://google.com)',
			text: 'abc',
			url: 'https://google.com',
		},
	]);

	expect(tokenize('[abc](https://google.com)[def](https://google.com)')).toEqual([
		{
			type: 'link',
			raw: '[abc](https://google.com)',
			text: 'abc',
			url: 'https://google.com',
		},
		{
			type: 'link',
			raw: '[def](https://google.com)',
			text: 'def',
			url: 'https://google.com',
		},
	]);

	expect(tokenize('[abc[def](example.com)')).toEqual([
		{
			type: 'text',
			raw: '[abc',
			text: '[abc',
		},
		{
			type: 'link',
			raw: '[def](example.com)',
			text: 'def',
			url: 'example.com',
		},
	]);

	expect(tokenize('[abc]def](example.com)')).toEqual([
		{
			type: 'text',
			raw: '[abc]def](example.com)',
			text: '[abc]def](example.com)',
		},
	]);

	expect(tokenize('[abc[]def](example.com)')).toEqual([
		{
			type: 'link',
			raw: '[abc[]def](example.com)',
			text: 'abc[]def',
			url: 'example.com',
		},
	]);
});

it('emotes', () => {
	expect(tokenize(':foo:')).toEqual([
		{
			type: 'emote',
			raw: ':foo:',
			name: 'foo',
		},
	]);

	expect(tokenize(':foo::bar:')).toEqual([
		{
			type: 'emote',
			raw: ':foo:',
			name: 'foo',
		},
		{
			type: 'emote',
			raw: ':bar:',
			name: 'bar',
		},
	]);
});
