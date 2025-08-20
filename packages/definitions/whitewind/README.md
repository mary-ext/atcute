# @atcute/whitewind

[WhiteWind](https://whtwnd.com) (com.whtwnd.\*) schema definitions

## usage

```ts
import { is } from '@atcute/lexicons';
import { ComWhtwndBlogEntry } from '@atcute/whitewind';

const record: ComWhtwndBlogEntry.Main = {
	$type: 'com.whtwnd.blog.entry',
	content: `# Hello world!`,
	visibility: 'public',
	createdAt: '2025-05-07T10:00:00.000Z',
};

is(ComWhtwndBlogEntry.mainSchema, record);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/whitewind"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/whitewind" />
```

```ts
// index.ts
import type {} from '@atcute/whitewind';
```

now all the XRPC operations should be visible in the client

## with `@atcute/lex-cli`

when building your own lexicons that reference WhiteWind types, configure lex-cli to import from
this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	mappings: [
		{
			nsid: ['com.whtwnd.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('com.whtwnd.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/whitewind/types/${specifier}` };
			},
		},
	],
});
```
