# @atcute/germ

[Germ Network](https://germnetwork.com) (`com.germnetwork.*`) schema definitions

## usage

```ts
import { ComGermnetworkDeclaration } from '@atcute/germ';
import { is } from '@atcute/lexicons';

const declaration: ComGermnetworkDeclaration.Main = {
	$type: 'com.germnetwork.declaration',
	version: '1.0.0',
	currentKey: { $bytes: '...' },
};

is(ComGermnetworkDeclaration.mainSchema, declaration);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// file: tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/germ"],
	},
}
```

```ts
// file: env.d.ts
/// <reference types="@atcute/germ" />
```

```ts
// file: index.ts
import type {} from '@atcute/germ';
```

### with `@atcute/lex-cli`

when building your own lexicons that reference Germ Network types, configure lex-cli to import from
this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/germ'],
});
```
