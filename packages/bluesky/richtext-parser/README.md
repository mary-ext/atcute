# @atcute/bluesky-richtext-parser

tokenizer for parsing Bluesky rich text syntax.

```sh
npm install @atcute/bluesky-richtext-parser
```

parses user input text into tokens for mentions, hashtags, links, and text formatting. supports
Bluesky's standard syntax plus Markdown-style formatting extensions.

## usage

### basic parsing

```ts
import { tokenize } from '@atcute/bluesky-richtext-parser';

const tokens = tokenize('hello @alice.bsky.social! check out #atproto');

// [
//   { type: 'text', raw: 'hello ', content: 'hello ' },
//   { type: 'mention', raw: '@alice.bsky.social', handle: 'alice.bsky.social' },
//   { type: 'text', raw: '! check out ', content: '! check out ' },
//   { type: 'topic', raw: '#atproto', name: 'atproto' }
// ]
```

## supported syntax

### mentions

```ts
tokenize('@alice.bsky.social');
// -> [{ type: 'mention', handle: 'alice.bsky.social' }]

tokenize('＠alice.bsky.social'); // fullwidth @ also works
// -> [{ type: 'mention', handle: 'alice.bsky.social' }]
```

### hashtags (topics)

```ts
tokenize('#atproto');
// -> [{ type: 'topic', name: 'atproto' }]

tokenize('＃atproto'); // fullwidth # also works
// -> [{ type: 'topic', name: 'atproto' }]
```

### auto-linked URLs

bare URLs are automatically detected:

```ts
tokenize('check out https://example.com');
// -> [
//   { type: 'text', content: 'check out ' },
//   { type: 'autolink', url: 'https://example.com' }
// ]
```

### markdown links

```ts
tokenize('[my website](https://example.com)');
// -> [{ type: 'link', url: 'https://example.com', children: [{ type: 'text', content: 'my website' }] }]
```

link text can contain nested formatting:

```ts
tokenize('[**bold link**](https://example.com)');
// -> [{ type: 'link', children: [{ type: 'strong', ... }] }]
```

### text formatting

```ts
// bold
tokenize('**bold text**');
// -> [{ type: 'strong', children: [{ type: 'text', content: 'bold text' }] }]

// italic
tokenize('*italic text*');
// -> [{ type: 'emphasis', children: [...] }]

tokenize('_also italic_');
// -> [{ type: 'emphasis', children: [...] }]

// underline
tokenize('__underlined__');
// -> [{ type: 'underline', children: [...] }]

// strikethrough
tokenize('~~deleted~~');
// -> [{ type: 'delete', children: [...] }]

// inline code
tokenize('use `npm install`');
// -> [{ type: 'text', ... }, { type: 'code', content: 'npm install' }]
```

### emotes

```ts
tokenize('hello :wave:');
// -> [{ type: 'text', ... }, { type: 'emote', name: 'wave' }]
```

### escapes

backslash escapes special characters:

```ts
tokenize('not a \\@mention');
// -> [{ type: 'text', ... }, { type: 'escape', escaped: '@' }, { type: 'text', ... }]
```

## handling tokens

process tokens to build facets or render content:

```ts
import { tokenize, type Token } from '@atcute/bluesky-richtext-parser';
import RichtextBuilder from '@atcute/bluesky-richtext-builder';

const resolveHandle = async (handle: string): Promise<string | null> => {
	// resolve handle to DID
};

const processTokens = async (tokens: Token[]): Promise<RichtextBuilder> => {
	const rt = new RichtextBuilder();

	for (const token of tokens) {
		switch (token.type) {
			case 'text':
				rt.addText(token.content);
				break;

			case 'mention': {
				const did = await resolveHandle(token.handle);
				if (did) {
					rt.addMention(token.raw, did);
				} else {
					rt.addText(token.raw);
				}
				break;
			}

			case 'topic':
				rt.addTag(token.name);
				break;

			case 'autolink':
				rt.addLink(token.url, token.url);
				break;

			case 'link':
				// flatten children to text
				const text = flattenToText(token.children);
				rt.addLink(text, token.url);
				break;

			case 'escape':
				rt.addText(token.escaped);
				break;

			// formatting tokens (strong, emphasis, etc.) don't map to facets
			// so just extract their text content
			case 'strong':
			case 'emphasis':
			case 'underline':
			case 'delete':
				rt.addText(flattenToText(token.children));
				break;

			case 'code':
				rt.addText(token.content);
				break;

			case 'emote':
				// handle emotes as needed
				rt.addText(token.raw);
				break;
		}
	}

	return rt;
};

const flattenToText = (tokens: Token[]): string => {
	return tokens
		.map((t) => {
			if ('content' in t) {
				return t.content;
			}
			if ('children' in t) {
				return flattenToText(t.children);
			}
			return t.raw;
		})
		.join('');
};
```

### token types

| type        | fields            | description                      |
| ----------- | ----------------- | -------------------------------- |
| `text`      | `content`         | plain text                       |
| `mention`   | `handle`          | @mention                         |
| `topic`     | `name`            | #hashtag                         |
| `emote`     | `name`            | :emote:                          |
| `autolink`  | `url`             | bare URL                         |
| `link`      | `url`, `children` | markdown link with nested tokens |
| `strong`    | `children`        | \*\*bold\*\*                     |
| `emphasis`  | `children`        | \_italic\_                       |
| `underline` | `children`        | \_\_underline\_\_                |
| `delete`    | `children`        | \~~strikethrough~~               |
| `code`      | `content`         | \`inline code`                   |
| `escape`    | `escaped`         | backslash escape                 |

all tokens have `raw` containing the original matched text.
