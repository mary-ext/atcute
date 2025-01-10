# @atcute/bluesky-search-parser

parse Bluesky's search syntax

```ts
const result = tokenize(`hello @bsky.app! check out my [website](https://example.com)`);

expect(result).toEqual([
	{
		type: 'text',
		raw: 'hello ',
		text: 'hello ',
	},
	{
		type: 'mention',
		raw: '@bsky.app',
		handle: 'bsky.app',
	},
	{
		type: 'text',
		raw: '! check out my ',
		text: '! check out my ',
	},
	{
		type: 'link',
		raw: '[website](https://example.com)',
		text: 'website',
		url: 'https://example.com',
	},
]);
```
