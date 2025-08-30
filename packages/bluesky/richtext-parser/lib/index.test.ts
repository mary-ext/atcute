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

	expect(tokenize('\n')).toEqual([
		{
			type: 'text',
			raw: '\n',
			text: '\n',
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

	expect(tokenize('\\＠bsky.app')).toEqual([
		{
			type: 'escape',
			raw: '\\＠',
			escaped: '＠',
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

	expect(tokenize('＠bsky.app')).toEqual([
		{
			type: 'mention',
			raw: '＠bsky.app',
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

	expect(tokenize('@abc.com @bca.com')).toEqual([
		{
			type: 'mention',
			raw: '@abc.com',
			handle: 'abc.com',
		},
		{
			type: 'text',
			raw: ' ',
			text: ' ',
		},
		{
			type: 'mention',
			raw: '@bca.com',
			handle: 'bca.com',
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

	expect(tokenize('＃cool')).toEqual([
		{
			type: 'topic',
			raw: '＃cool',
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

	expect(tokenize('#abc #def')).toEqual([
		{
			type: 'topic',
			raw: '#abc',
			name: 'abc',
		},
		{
			type: 'text',
			raw: ' ',
			text: ' ',
		},
		{
			type: 'topic',
			raw: '#def',
			name: 'def',
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
			raw: 'https://example.com/.',
			url: 'https://example.com/.',
		},
		{
			type: 'text',
			raw: ')',
			text: ')',
		},
	]);

	expect(tokenize('https://example.com/.))')).toEqual([
		{
			type: 'autolink',
			raw: 'https://example.com/.)',
			url: 'https://example.com/.)',
		},
		{
			type: 'text',
			raw: ')',
			text: ')',
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

	expect(
		tokenize(
			'https://github.com/mary-ext/atproto-scraping/commit/\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
		),
	).toEqual([
		{
			type: 'autolink',
			raw: 'https://github.com/mary-ext/atproto-scraping/commit/',
			url: 'https://github.com/mary-ext/atproto-scraping/commit/',
		},
		{
			type: 'text',
			raw: '\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
			text: '\ncaaa495ae654ef8a98f223f3cecfe2ca261d6b4f',
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

	expect(tokenize(':::')).toEqual([
		{
			type: 'text',
			raw: ':::',
			text: ':::',
		},
	]);
	expect(tokenize('::::')).toEqual([
		{
			type: 'text',
			raw: '::::',
			text: '::::',
		},
	]);
});

it('delete', () => {
	expect(tokenize('~~strike~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~strike~~",
	      "tokens": [
	        {
	          "raw": "strike",
	          "text": "strike",
	          "type": "text",
	        },
	      ],
	      "type": "delete",
	    },
	  ]
	`);

	expect(tokenize('~strike~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~strike~",
	      "text": "~strike~",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~",
	      "text": "~~",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('~~~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~~~",
	      "text": "~~~~",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('~~ ~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~ ~~",
	      "tokens": [
	        {
	          "raw": " ",
	          "text": " ",
	          "type": "text",
	        },
	      ],
	      "type": "delete",
	    },
	  ]
	`);

	expect(tokenize('foo~~bar~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "~~bar~~",
	      "tokens": [
	        {
	          "raw": "bar",
	          "text": "bar",
	          "type": "text",
	        },
	      ],
	      "type": "delete",
	    },
	  ]
	`);

	expect(tokenize('~~ strike~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~ strike~~",
	      "tokens": [
	        {
	          "raw": " strike",
	          "text": " strike",
	          "type": "text",
	        },
	      ],
	      "type": "delete",
	    },
	  ]
	`);

	expect(tokenize('~~~strike~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~~strike~~",
	      "tokens": [
	        {
	          "raw": "~strike",
	          "text": "~strike",
	          "type": "text",
	        },
	      ],
	      "type": "delete",
	    },
	  ]
	`);

	expect(tokenize('~~strike~~~')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "~~strike~~",
	      "tokens": [
	        {
	          "raw": "strike",
	          "text": "strike",
	          "type": "text",
	        },
	      ],
	      "type": "delete",
	    },
	    {
	      "raw": "~",
	      "text": "~",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('hello ~~@alice.bsky.social~~ @bob.bsky.social!')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "hello ",
	      "text": "hello ",
	      "type": "text",
	    },
	    {
	      "raw": "~~@alice.bsky.social~~",
	      "tokens": [
	        {
	          "handle": "alice.bsky.social",
	          "raw": "@alice.bsky.social",
	          "type": "mention",
	        },
	      ],
	      "type": "delete",
	    },
	    {
	      "raw": " ",
	      "text": " ",
	      "type": "text",
	    },
	    {
	      "handle": "bob.bsky.social",
	      "raw": "@bob.bsky.social",
	      "type": "mention",
	    },
	    {
	      "raw": "!",
	      "text": "!",
	      "type": "text",
	    },
	  ]
	`);
});

it('emphasis/strong', () => {
	expect(tokenize('*emphasized*')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "*emphasized*",
	      "tokens": [
	        {
	          "raw": "emphasized",
	          "text": "emphasized",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);
	expect(tokenize('_emphasized_')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "_emphasized_",
	      "tokens": [
	        {
	          "raw": "emphasized",
	          "text": "emphasized",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('**boldened**')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "**boldened**",
	      "tokens": [
	        {
	          "raw": "boldened",
	          "text": "boldened",
	          "type": "text",
	        },
	      ],
	      "type": "strong",
	    },
	  ]
	`);

	expect(tokenize('***emphasized and boldened***')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "***emphasized and boldened***",
	      "tokens": [
	        {
	          "raw": "**emphasized and boldened**",
	          "tokens": [
	            {
	              "raw": "emphasized and boldened",
	              "text": "emphasized and boldened",
	              "type": "text",
	            },
	          ],
	          "type": "strong",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);
	expect(tokenize('___emphasized and underlined___')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "___emphasized and underlined___",
	      "tokens": [
	        {
	          "raw": "__emphasized and underlined__",
	          "tokens": [
	            {
	              "raw": "emphasized and underlined",
	              "text": "emphasized and underlined",
	              "type": "text",
	            },
	          ],
	          "type": "underline",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('*emphasized **and also boldened***')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "*emphasized **and also boldened***",
	      "tokens": [
	        {
	          "raw": "emphasized ",
	          "text": "emphasized ",
	          "type": "text",
	        },
	        {
	          "raw": "**and also boldened**",
	          "tokens": [
	            {
	              "raw": "and also boldened",
	              "text": "and also boldened",
	              "type": "text",
	            },
	          ],
	          "type": "strong",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);
	expect(tokenize('_emphasized __and underlined___')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "_emphasized __and underlined___",
	      "tokens": [
	        {
	          "raw": "emphasized ",
	          "text": "emphasized ",
	          "type": "text",
	        },
	        {
	          "raw": "__and underlined__",
	          "tokens": [
	            {
	              "raw": "and underlined",
	              "text": "and underlined",
	              "type": "text",
	            },
	          ],
	          "type": "underline",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('**boldened *and also emphasized***')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "**boldened *and also emphasized***",
	      "tokens": [
	        {
	          "raw": "boldened ",
	          "text": "boldened ",
	          "type": "text",
	        },
	        {
	          "raw": "*and also emphasized*",
	          "tokens": [
	            {
	              "raw": "and also emphasized",
	              "text": "and also emphasized",
	              "type": "text",
	            },
	          ],
	          "type": "emphasis",
	        },
	      ],
	      "type": "strong",
	    },
	  ]
	`);

	expect(tokenize('__underlined _and also emphasized___')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "__underlined _and also emphasized___",
	      "tokens": [
	        {
	          "raw": "underlined ",
	          "text": "underlined ",
	          "type": "text",
	        },
	        {
	          "raw": "_and also emphasized_",
	          "tokens": [
	            {
	              "raw": "and also emphasized",
	              "text": "and also emphasized",
	              "type": "text",
	            },
	          ],
	          "type": "emphasis",
	        },
	      ],
	      "type": "underline",
	    },
	  ]
	`);

	expect(tokenize('foo*bar*')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "*bar*",
	      "tokens": [
	        {
	          "raw": "bar",
	          "text": "bar",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);
	expect(tokenize('foo_bar_')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "_bar_",
	      "tokens": [
	        {
	          "raw": "bar",
	          "text": "bar",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('foo*bar*buzz')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "*bar*",
	      "tokens": [
	        {
	          "raw": "bar",
	          "text": "bar",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	    {
	      "raw": "buzz",
	      "text": "buzz",
	      "type": "text",
	    },
	  ]
	`);
	expect(tokenize('foo_bar_buzz')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo_bar_buzz",
	      "text": "foo_bar_buzz",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('foo*bar *')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "*bar *",
	      "tokens": [
	        {
	          "raw": "bar ",
	          "text": "bar ",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);
	expect(tokenize('foo_bar _')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "_bar _",
	      "tokens": [
	        {
	          "raw": "bar ",
	          "text": "bar ",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('***foo**')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "***foo**",
	      "tokens": [
	        {
	          "raw": "*foo",
	          "text": "*foo",
	          "type": "text",
	        },
	      ],
	      "type": "strong",
	    },
	  ]
	`);
	expect(tokenize('**foo***')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "**foo***",
	      "tokens": [
	        {
	          "raw": "foo*",
	          "text": "foo*",
	          "type": "text",
	        },
	      ],
	      "type": "strong",
	    },
	  ]
	`);

	expect(tokenize('* *')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "* *",
	      "tokens": [
	        {
	          "raw": " ",
	          "text": " ",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);
	expect(tokenize('_ _')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "_ _",
	      "tokens": [
	        {
	          "raw": " ",
	          "text": " ",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('hello **world**!')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "hello ",
	      "text": "hello ",
	      "type": "text",
	    },
	    {
	      "raw": "**world**",
	      "tokens": [
	        {
	          "raw": "world",
	          "text": "world",
	          "type": "text",
	        },
	      ],
	      "type": "strong",
	    },
	    {
	      "raw": "!",
	      "text": "!",
	      "type": "text",
	    },
	  ]
	`);
});

it('underline', () => {
	expect(tokenize('__underlined__')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "__underlined__",
	      "tokens": [
	        {
	          "raw": "underlined",
	          "text": "underlined",
	          "type": "text",
	        },
	      ],
	      "type": "underline",
	    },
	  ]
	`);

	expect(tokenize('__')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "__",
	      "text": "__",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('____')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "____",
	      "tokens": [
	        {
	          "raw": "__",
	          "text": "__",
	          "type": "text",
	        },
	      ],
	      "type": "emphasis",
	    },
	  ]
	`);

	expect(tokenize('__ __')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "__ __",
	      "tokens": [
	        {
	          "raw": " ",
	          "text": " ",
	          "type": "text",
	        },
	      ],
	      "type": "underline",
	    },
	  ]
	`);

	expect(tokenize('foo__bar__')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "raw": "__bar__",
	      "tokens": [
	        {
	          "raw": "bar",
	          "text": "bar",
	          "type": "text",
	        },
	      ],
	      "type": "underline",
	    },
	  ]
	`);

	expect(tokenize('\\__underlined__')).toMatchInlineSnapshot(`
	  [
	    {
	      "escaped": "_",
	      "raw": "\\_",
	      "type": "escape",
	    },
	    {
	      "raw": "_underlined__",
	      "text": "_underlined__",
	      "type": "text",
	    },
	  ]
	`);

	expect(tokenize('foo\\__bar__')).toMatchInlineSnapshot(`
	  [
	    {
	      "raw": "foo",
	      "text": "foo",
	      "type": "text",
	    },
	    {
	      "escaped": "_",
	      "raw": "\\_",
	      "type": "escape",
	    },
	    {
	      "raw": "_bar__",
	      "text": "_bar__",
	      "type": "text",
	    },
	  ]
	`);
});
