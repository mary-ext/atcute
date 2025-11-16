# @atcute/frontpage

[Frontpage](https://frontpage.fyi/) (fyi.unravel.frontpage.\*) schema definitions

## usage

```ts
import { FyiUnravelFrontpagePost } from '@atcute/frontpage';
import { is } from '@atcute/lexicons';

const post: FyiUnravelFrontpagePost.Main = {
	$type: 'fyi.unravel.frontpage.post',
	url: 'https://github.com/mary-ext/atcute',
	title: 'collection of lightweight TypeScript packages for dealing with AT Protocol',
	createdAt: '2024-10-16T16:12:01.599Z',
};

is(FyiUnravelFrontpagePost.mainSchema, post);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/frontpage"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/frontpage" />
```

```ts
// index.ts
import type {} from '@atcute/frontpage';
```

now all the XRPC operations should be visible in the client

### with `@atcute/lex-cli`

when building your own lexicons that reference Frontpage types, configure lex-cli to import from
this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/frontpage'],
});
```
