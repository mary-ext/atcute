# @atcute/bluesky-search-parser

tokenizer for Bluesky's search query syntax.

```sh
npm install @atcute/bluesky-search-parser
```

useful for building search UIs that need to parse and manipulate search queries, such as
highlighting operators or extracting filter values.

```ts
import { tokenize } from '@atcute/bluesky-search-parser';

const tokens = tokenize(`from:me hello "foo bar"`);
// [
//   { type: 'word', value: 'from:me' },
//   { type: 'whitespace', value: ' ' },
//   { type: 'word', value: 'hello' },
//   { type: 'whitespace', value: ' ' },
//   { type: 'quoted', value: '"foo bar"' },
// ]
```
