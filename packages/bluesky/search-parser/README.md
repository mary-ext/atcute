# @atcute/bluesky-search-parser

parse Bluesky's search syntax

```ts
const result = tokenize(`from:me hello "foo bar"`);

expect(result).toEqual([
	{ type: 'word', value: 'from:me' },
	{ type: 'whitespace', value: ' ' },
	{ type: 'word', value: 'hello' },
	{ type: 'whitespace', value: ' ' },
	{ type: 'quoted', value: '"foo bar"' },
]);
```
