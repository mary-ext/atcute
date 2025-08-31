import { expect, it } from 'bun:test';

import { tokenize } from './index.js';

it('plain', () => {
	expect(tokenize('hello world')).toEqual([
		{
			content: 'hello world',
			raw: 'hello world',
			type: 'text',
		},
	]);

	expect(tokenize('\n')).toEqual([
		{
			content: '\n',
			raw: '\n',
			type: 'text',
		},
	]);
});

it('escapes', () => {
	expect(tokenize('\\@bsky.app')).toEqual([
		{
			escaped: '@',
			raw: '\\@',
			type: 'escape',
		},
		{
			content: 'bsky.app',
			raw: 'bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('\\＠bsky.app')).toEqual([
		{
			escaped: '＠',
			raw: '\\＠',
			type: 'escape',
		},
		{
			content: 'bsky.app',
			raw: 'bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('\\h')).toEqual([
		{
			content: '\\h',
			raw: '\\h',
			type: 'text',
		},
	]);

	expect(tokenize('\\')).toEqual([
		{
			content: '\\',
			raw: '\\',
			type: 'text',
		},
	]);
});

it('mentions', () => {
	expect(tokenize('@bsky.app')).toEqual([
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
	]);

	expect(tokenize('＠bsky.app')).toEqual([
		{
			handle: 'bsky.app',
			raw: '＠bsky.app',
			type: 'mention',
		},
	]);

	expect(tokenize('hello@bsky.app')).toEqual([
		{
			content: 'hello@bsky.app',
			raw: 'hello@bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('hello(@bsky.app')).toEqual([
		{
			content: 'hello(',
			raw: 'hello(',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
	]);

	expect(tokenize('@bsky.app.')).toEqual([
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
		{
			content: '.',
			raw: '.',
			type: 'text',
		},
	]);

	expect(tokenize('@bsky.app@')).toEqual([
		{
			content: '@bsky.app@',
			raw: '@bsky.app@',
			type: 'text',
		},
	]);

	expect(tokenize('@@bsky.app')).toEqual([
		{
			content: '@@bsky.app',
			raw: '@@bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('@@@bsky.app')).toEqual([
		{
			content: '@@@bsky.app',
			raw: '@@@bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('@(@bsky.app')).toEqual([
		{
			content: '@(',
			raw: '@(',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
	]);

	expect(tokenize('@(@@bsky.app')).toEqual([
		{
			content: '@(',
			raw: '@(@@bsky.app',
			type: 'text',
		},
	]);

	expect(tokenize('hello @bsky.app@')).toEqual([
		{
			content: 'hello ',
			raw: 'hello @bsky.app@',
			type: 'text',
		},
	]);

	expect(tokenize('@bsky.app.@')).toEqual([
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
		{
			content: '.',
			raw: '.@',
			type: 'text',
		},
	]);

	expect(tokenize('(@bsky.app)')).toEqual([
		{
			content: '(',
			raw: '(',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
		{
			content: ')',
			raw: ')',
			type: 'text',
		},
	]);

	expect(tokenize('@bsky.app hello')).toEqual([
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
		{
			content: ' hello',
			raw: ' hello',
			type: 'text',
		},
	]);

	expect(tokenize('hello @bsky.app hello')).toEqual([
		{
			content: 'hello ',
			raw: 'hello ',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
		{
			content: ' hello',
			raw: ' hello',
			type: 'text',
		},
	]);

	expect(tokenize('hello @bsky.app')).toEqual([
		{
			content: 'hello ',
			raw: 'hello ',
			type: 'text',
		},
		{
			handle: 'bsky.app',
			raw: '@bsky.app',
			type: 'mention',
		},
	]);

	expect(tokenize('@abc.com @bca.com')).toEqual([
		{
			handle: 'abc.com',
			raw: '@abc.com',
			type: 'mention',
		},
		{
			content: ' ',
			raw: ' ',
			type: 'text',
		},
		{
			handle: 'bca.com',
			raw: '@bca.com',
			type: 'mention',
		},
	]);

	expect(tokenize('@example.co.id')).toEqual([
		{
			handle: 'example.co.id',
			raw: '@example.co.id',
			type: 'mention',
		},
	]);
});

it('topics', () => {
	expect(tokenize('#cool')).toEqual([
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
	]);

	expect(tokenize('＃cool')).toEqual([
		{
			name: 'cool',
			raw: '＃cool',
			type: 'topic',
		},
	]);

	expect(tokenize('#123')).toEqual([
		{
			content: '#123',
			raw: '#123',
			type: 'text',
		},
	]);

	expect(tokenize('#123cool')).toEqual([
		{
			name: '123cool',
			raw: '#123cool',
			type: 'topic',
		},
	]);

	expect(tokenize('#cool123')).toEqual([
		{
			name: 'cool123',
			raw: '#cool123',
			type: 'topic',
		},
	]);

	expect(tokenize('hello#cool')).toEqual([
		{
			content: 'hello#cool',
			raw: 'hello#cool',
			type: 'text',
		},
	]);

	expect(tokenize('hello(#cool')).toEqual([
		{
			content: 'hello(',
			raw: 'hello(',
			type: 'text',
		},
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
	]);

	expect(tokenize('#cool.')).toEqual([
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
		{
			content: '.',
			raw: '.',
			type: 'text',
		},
	]);

	expect(tokenize('#cool#')).toEqual([
		{
			content: '#cool#',
			raw: '#cool#',
			type: 'text',
		},
	]);

	expect(tokenize('hello #cool#')).toEqual([
		{
			content: 'hello ',
			raw: 'hello #cool#',
			type: 'text',
		},
	]);

	expect(tokenize('#cool.#')).toEqual([
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
		{
			content: '.',
			raw: '.#',
			type: 'text',
		},
	]);

	expect(tokenize('#cool hello')).toEqual([
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
		{
			content: ' hello',
			raw: ' hello',
			type: 'text',
		},
	]);

	expect(tokenize('hello #cool hello')).toEqual([
		{
			content: 'hello ',
			raw: 'hello ',
			type: 'text',
		},
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
		{
			content: ' hello',
			raw: ' hello',
			type: 'text',
		},
	]);

	expect(tokenize('hello #cool')).toEqual([
		{
			content: 'hello ',
			raw: 'hello ',
			type: 'text',
		},
		{
			name: 'cool',
			raw: '#cool',
			type: 'topic',
		},
	]);

	expect(tokenize('#abc #def')).toEqual([
		{
			name: 'abc',
			raw: '#abc',
			type: 'topic',
		},
		{
			content: ' ',
			raw: ' ',
			type: 'text',
		},
		{
			name: 'def',
			raw: '#def',
			type: 'topic',
		},
	]);
});

it('autolinks', () => {
	expect(tokenize('https://example.com')).toEqual([
		{
			raw: 'https://example.com',
			url: 'https://example.com',
			type: 'autolink',
		},
	]);

	expect(tokenize('https://')).toEqual([
		{
			content: 'https',
			raw: 'https://',
			type: 'text',
		},
	]);

	expect(tokenize('https://example.com/.')).toEqual([
		{
			raw: 'https://example.com/',
			url: 'https://example.com/',
			type: 'autolink',
		},
		{
			content: '.',
			raw: '.',
			type: 'text',
		},
	]);

	expect(tokenize('https://example.com/.)')).toEqual([
		{
			raw: 'https://example.com/.',
			url: 'https://example.com/.',
			type: 'autolink',
		},
		{
			content: ')',
			raw: ')',
			type: 'text',
		},
	]);

	expect(tokenize('https://example.com/.))')).toEqual([
		{
			raw: 'https://example.com/.)',
			url: 'https://example.com/.)',
			type: 'autolink',
		},
		{
			content: ')',
			raw: ')',
			type: 'text',
		},
	]);

	expect(tokenize('https://foo.com/thing_cool)')).toEqual([
		{
			raw: 'https://foo.com/thing_cool',
			url: 'https://foo.com/thing_cool',
			type: 'autolink',
		},
		{
			content: ')',
			raw: ')',
			type: 'text',
		},
	]);

	expect(tokenize('https://foo.com/thing_(cool)')).toEqual([
		{
			raw: 'https://foo.com/thing_(cool)',
			url: 'https://foo.com/thing_(cool)',
			type: 'autolink',
		},
	]);

	expect(tokenize('abchttps://example.com/')).toEqual([
		{
			content: 'abc',
			raw: 'abc',
			type: 'text',
		},
		{
			raw: 'https://example.com/',
			url: 'https://example.com/',
			type: 'autolink',
		},
	]);

	expect(
		tokenize(
			'https://github.com/mary-ext/atproto-scraping/commit/\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
		),
	).toEqual([
		{
			raw: 'https://github.com/mary-ext/atproto-scraping/commit/',
			url: 'https://github.com/mary-ext/atproto-scraping/commit/',
			type: 'autolink',
		},
		{
			content: '\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
			raw: '\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
			type: 'text',
		},
	]);
});

it('links', () => {
	expect(tokenize('[abc](https://google.com)')).toEqual([
		{
			children: [
				{
					content: 'abc',
					raw: 'abc',
					type: 'text',
				},
			],
			raw: '[abc](https://google.com)',
			url: 'https://google.com',
			type: 'link',
		},
	]);

	expect(tokenize('[abc](https://google.com)[def](https://google.com)')).toEqual([
		{
			children: [
				{
					content: 'abc',
					raw: 'abc',
					type: 'text',
				},
			],
			raw: '[abc](https://google.com)',
			url: 'https://google.com',
			type: 'link',
		},
		{
			children: [
				{
					content: 'def',
					raw: 'def',
					type: 'text',
				},
			],
			raw: '[def](https://google.com)',
			url: 'https://google.com',
			type: 'link',
		},
	]);

	expect(tokenize('[abc[def](example.com)')).toEqual([
		{
			content: '[abc',
			raw: '[abc',
			type: 'text',
		},
		{
			children: [
				{
					content: 'def',
					raw: 'def',
					type: 'text',
				},
			],
			raw: '[def](example.com)',
			url: 'example.com',
			type: 'link',
		},
	]);

	expect(tokenize('[abc]def](example.com)')).toEqual([
		{
			children: [
				{
					content: 'abc]def',
					raw: 'abc]def',
					type: 'text',
				},
			],
			raw: '[abc]def](example.com)',
			url: 'example.com',
			type: 'link',
		},
	]);

	expect(tokenize('[abc[]def](example.com)')).toEqual([
		{
			children: [
				{
					content: 'abc',
					raw: 'abc[]def',
					type: 'text',
				},
			],
			raw: '[abc[]def](example.com)',
			url: 'example.com',
			type: 'link',
		},
	]);

	expect(tokenize('[**mixed** formatting](example.com)')).toEqual([
		{
			children: [
				{
					children: [
						{
							content: 'mixed',
							raw: 'mixed',
							type: 'text',
						},
					],
					raw: '**mixed**',
					type: 'strong',
				},
				{
					content: ' formatting',
					raw: ' formatting',
					type: 'text',
				},
			],
			raw: '[**mixed** formatting](example.com)',
			type: 'link',
			url: 'example.com',
		},
	]);
});

it('emotes', () => {
	expect(tokenize(':foo:')).toEqual([
		{
			name: 'foo',
			raw: ':foo:',
			type: 'emote',
		},
	]);

	expect(tokenize(':foo::bar:')).toEqual([
		{
			name: 'foo',
			raw: ':foo:',
			type: 'emote',
		},
		{
			name: 'bar',
			raw: ':bar:',
			type: 'emote',
		},
	]);

	expect(tokenize(':::')).toEqual([
		{
			content: ':',
			raw: ':::',
			type: 'text',
		},
	]);
	expect(tokenize('::::')).toEqual([
		{
			content: ':',
			raw: '::::',
			type: 'text',
		},
	]);
});

it('delete', () => {
	expect(tokenize('~~strike~~')).toEqual([
		{
			children: [
				{
					content: 'strike',
					raw: 'strike',
					type: 'text',
				},
			],
			raw: '~~strike~~',
			type: 'delete',
		},
	]);

	expect(tokenize('~strike~')).toEqual([
		{
			content: '~strike',
			raw: '~strike~',
			type: 'text',
		},
	]);

	expect(tokenize('~~')).toEqual([
		{
			content: '~',
			raw: '~~',
			type: 'text',
		},
	]);

	expect(tokenize('~~~~')).toEqual([
		{
			content: '~',
			raw: '~~~~',
			type: 'text',
		},
	]);

	expect(tokenize('~~ ~~')).toEqual([
		{
			children: [
				{
					content: ' ',
					raw: ' ',
					type: 'text',
				},
			],
			raw: '~~ ~~',
			type: 'delete',
		},
	]);

	expect(tokenize('foo~~bar~~')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			children: [
				{
					content: 'bar',
					raw: 'bar',
					type: 'text',
				},
			],
			raw: '~~bar~~',
			type: 'delete',
		},
	]);

	expect(tokenize('~~ strike~~')).toEqual([
		{
			children: [
				{
					content: ' strike',
					raw: ' strike',
					type: 'text',
				},
			],
			raw: '~~ strike~~',
			type: 'delete',
		},
	]);

	expect(tokenize('~~~strike~~')).toEqual([
		{
			children: [
				{
					content: '~strike',
					raw: '~strike',
					type: 'text',
				},
			],
			raw: '~~~strike~~',
			type: 'delete',
		},
	]);

	expect(tokenize('~~strike~~~')).toEqual([
		{
			children: [
				{
					content: 'strike',
					raw: 'strike',
					type: 'text',
				},
			],
			raw: '~~strike~~',
			type: 'delete',
		},
		{
			content: '~',
			raw: '~',
			type: 'text',
		},
	]);

	expect(tokenize('hello ~~@alice.bsky.social~~ @bob.bsky.social!')).toEqual([
		{
			content: 'hello ',
			raw: 'hello ',
			type: 'text',
		},
		{
			children: [
				{
					handle: 'alice.bsky.social',
					raw: '@alice.bsky.social',
					type: 'mention',
				},
			],
			raw: '~~@alice.bsky.social~~',
			type: 'delete',
		},
		{
			content: ' ',
			raw: ' ',
			type: 'text',
		},
		{
			handle: 'bob.bsky.social',
			raw: '@bob.bsky.social',
			type: 'mention',
		},
		{
			content: '!',
			raw: '!',
			type: 'text',
		},
	]);
});

it('emphasis/strong', () => {
	expect(tokenize('*emphasized*')).toEqual([
		{
			children: [
				{
					content: 'emphasized',
					raw: 'emphasized',
					type: 'text',
				},
			],
			raw: '*emphasized*',
			type: 'emphasis',
		},
	]);
	expect(tokenize('_emphasized_')).toEqual([
		{
			children: [
				{
					content: 'emphasized',
					raw: 'emphasized',
					type: 'text',
				},
			],
			raw: '_emphasized_',
			type: 'emphasis',
		},
	]);

	expect(tokenize('**boldened**')).toEqual([
		{
			children: [
				{
					content: 'boldened',
					raw: 'boldened',
					type: 'text',
				},
			],
			raw: '**boldened**',
			type: 'strong',
		},
	]);

	expect(tokenize('***emphasized and boldened***')).toEqual([
		{
			children: [
				{
					children: [
						{
							content: 'emphasized and boldened',
							raw: 'emphasized and boldened',
							type: 'text',
						},
					],
					raw: '**emphasized and boldened**',
					type: 'strong',
				},
			],
			raw: '***emphasized and boldened***',
			type: 'emphasis',
		},
	]);

	expect(tokenize('___emphasized and underlined___')).toEqual([
		{
			children: [
				{
					children: [
						{
							content: 'emphasized and underlined',
							raw: 'emphasized and underlined',
							type: 'text',
						},
					],
					raw: '__emphasized and underlined__',
					type: 'underline',
				},
			],
			raw: '___emphasized and underlined___',
			type: 'emphasis',
		},
	]);

	expect(tokenize('***boldened** but then not*')).toEqual([
		{
			children: [
				{
					children: [
						{
							content: 'boldened',
							raw: 'boldened',
							type: 'text',
						},
					],
					raw: '**boldened**',
					type: 'strong',
				},
				{
					content: ' but then not',
					raw: ' but then not',
					type: 'text',
				},
			],
			raw: '***boldened** but then not*',
			type: 'emphasis',
		},
	]);
	expect(tokenize('___underlined__ but then not_')).toEqual([
		{
			children: [
				{
					children: [
						{
							content: 'underlined',
							raw: 'underlined',
							type: 'text',
						},
					],
					raw: '__underlined__',
					type: 'underline',
				},
				{
					content: ' but then not',
					raw: ' but then not',
					type: 'text',
				},
			],
			raw: '___underlined__ but then not_',
			type: 'emphasis',
		},
	]);

	expect(tokenize('*emphasized **and also boldened***')).toEqual([
		{
			children: [
				{
					content: 'emphasized ',
					raw: 'emphasized ',
					type: 'text',
				},
				{
					children: [
						{
							content: 'and also boldened',
							raw: 'and also boldened',
							type: 'text',
						},
					],
					raw: '**and also boldened**',
					type: 'strong',
				},
			],
			raw: '*emphasized **and also boldened***',
			type: 'emphasis',
		},
	]);
	expect(tokenize('_emphasized __and underlined___')).toEqual([
		{
			children: [
				{
					content: 'emphasized ',
					raw: 'emphasized ',
					type: 'text',
				},
				{
					children: [
						{
							content: 'and underlined',
							raw: 'and underlined',
							type: 'text',
						},
					],
					raw: '__and underlined__',
					type: 'underline',
				},
			],
			raw: '_emphasized __and underlined___',
			type: 'emphasis',
		},
	]);

	expect(tokenize('**boldened *and also emphasized***')).toEqual([
		{
			children: [
				{
					content: 'boldened ',
					raw: 'boldened ',
					type: 'text',
				},
				{
					children: [
						{
							content: 'and also emphasized',
							raw: 'and also emphasized',
							type: 'text',
						},
					],
					raw: '*and also emphasized*',
					type: 'emphasis',
				},
			],
			raw: '**boldened *and also emphasized***',
			type: 'strong',
		},
	]);

	expect(tokenize('__underlined _and also emphasized___')).toEqual([
		{
			children: [
				{
					content: 'underlined ',
					raw: 'underlined ',
					type: 'text',
				},
				{
					children: [
						{
							content: 'and also emphasized',
							raw: 'and also emphasized',
							type: 'text',
						},
					],
					raw: '_and also emphasized_',
					type: 'emphasis',
				},
			],
			raw: '__underlined _and also emphasized___',
			type: 'underline',
		},
	]);

	expect(tokenize('foo*bar*')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			children: [
				{
					content: 'bar',
					raw: 'bar',
					type: 'text',
				},
			],
			raw: '*bar*',
			type: 'emphasis',
		},
	]);
	expect(tokenize('foo_bar_')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			children: [
				{
					content: 'bar',
					raw: 'bar',
					type: 'text',
				},
			],
			raw: '_bar_',
			type: 'emphasis',
		},
	]);

	expect(tokenize('foo*bar*buzz')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			children: [
				{
					content: 'bar',
					raw: 'bar',
					type: 'text',
				},
			],
			raw: '*bar*',
			type: 'emphasis',
		},
		{
			content: 'buzz',
			raw: 'buzz',
			type: 'text',
		},
	]);
	expect(tokenize('foo_bar_buzz')).toEqual([
		{
			content: 'foo',
			raw: 'foo_bar_buzz',
			type: 'text',
		},
	]);

	expect(tokenize('foo*bar *')).toEqual([
		{
			content: 'foo',
			raw: 'foo*bar *',
			type: 'text',
		},
	]);
	expect(tokenize('foo_bar _')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			children: [
				{
					content: 'bar ',
					raw: 'bar ',
					type: 'text',
				},
			],
			raw: '_bar _',
			type: 'emphasis',
		},
	]);

	expect(tokenize('***foo**')).toEqual([
		{
			children: [
				{
					content: '*foo',
					raw: '*foo',
					type: 'text',
				},
			],
			raw: '***foo**',
			type: 'strong',
		},
	]);
	expect(tokenize('**foo***')).toEqual([
		{
			children: [
				{
					content: 'foo',
					raw: 'foo*',
					type: 'text',
				},
			],
			raw: '**foo***',
			type: 'strong',
		},
	]);

	expect(tokenize('* *')).toEqual([
		{
			content: '* ',
			raw: '* *',
			type: 'text',
		},
	]);
	expect(tokenize('_ _')).toEqual([
		{
			children: [
				{
					content: ' ',
					raw: ' ',
					type: 'text',
				},
			],
			raw: '_ _',
			type: 'emphasis',
		},
	]);

	expect(tokenize('hello **world**!')).toEqual([
		{
			content: 'hello ',
			raw: 'hello ',
			type: 'text',
		},
		{
			children: [
				{
					content: 'world',
					raw: 'world',
					type: 'text',
				},
			],
			raw: '**world**',
			type: 'strong',
		},
		{
			content: '!',
			raw: '!',
			type: 'text',
		},
	]);
});

it('underline', () => {
	expect(tokenize('__underlined__')).toEqual([
		{
			children: [
				{
					content: 'underlined',
					raw: 'underlined',
					type: 'text',
				},
			],
			raw: '__underlined__',
			type: 'underline',
		},
	]);

	expect(tokenize('__')).toEqual([
		{
			content: '_',
			raw: '__',
			type: 'text',
		},
	]);

	expect(tokenize('____')).toEqual([
		{
			children: [
				{
					content: '_',
					raw: '__',
					type: 'text',
				},
			],
			raw: '____',
			type: 'emphasis',
		},
	]);

	expect(tokenize('__ __')).toEqual([
		{
			children: [
				{
					content: ' ',
					raw: ' ',
					type: 'text',
				},
			],
			raw: '__ __',
			type: 'underline',
		},
	]);

	expect(tokenize('foo__bar__')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			children: [
				{
					content: 'bar',
					raw: 'bar',
					type: 'text',
				},
			],
			raw: '__bar__',
			type: 'underline',
		},
	]);

	expect(tokenize('\\__underlined__')).toEqual([
		{
			escaped: '_',
			raw: '\\_',
			type: 'escape',
		},
		{
			content: '_underlined',
			raw: '_underlined__',
			type: 'text',
		},
	]);

	expect(tokenize('foo\\__bar__')).toEqual([
		{
			content: 'foo',
			raw: 'foo',
			type: 'text',
		},
		{
			escaped: '_',
			raw: '\\_',
			type: 'escape',
		},
		{
			content: '_bar',
			raw: '_bar__',
			type: 'text',
		},
	]);
});

it('code', () => {
	expect(tokenize('`code`')).toEqual([
		{
			content: 'code',
			raw: '`code`',
			type: 'code',
		},
	]);

	expect(tokenize('``code``')).toEqual([
		{
			content: 'code',
			raw: '``code``',
			type: 'code',
		},
	]);

	expect(tokenize('````foo`bar````')).toEqual([
		{
			content: 'foo`bar',
			raw: '````foo`bar````',
			type: 'code',
		},
	]);
});
