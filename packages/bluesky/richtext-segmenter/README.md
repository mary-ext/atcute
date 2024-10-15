# @atcute/bluesky-richtext-segmenter

segments Bluesky's rich text facets into tokens.

```ts
const result = segmentize('hello @bsky.app! check out my website', [
	{
		index: { byteStart: 6, byteEnd: 15 },
		features: [
			{
				$type: 'app.bsky.richtext.facet#mention',
				did: 'did:plc:z72i7hdynmk6r22z27h6tvur',
			},
		],
	},
	{
		index: { byteStart: 30, byteEnd: 37 },
		features: [
			{
				$type: 'app.bsky.richtext.facet#link',
				uri: 'https://example.com',
			},
		],
	},
]);

expect(result).toEqual([
	{
		text: 'hello ',
		features: undefined,
	},
	{
		text: '@bsky.app',
		features: [
			{
				$type: 'app.bsky.richtext.facet#mention',
				did: 'did:plc:z72i7hdynmk6r22z27h6tvur',
			},
		],
	},
	{
		text: '! check out my ',
		features: undefined,
	},
	{
		text: 'website',
		features: [
			{
				$type: 'app.bsky.richtext.facet#link',
				uri: 'https://example.com',
			},
		],
	},
]);
```
