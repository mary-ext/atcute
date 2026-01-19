# @atcute/standard-site

[standard.site](https://standard.site) (site.standard.\*) schema definitions

```sh
npm install @atcute/standard-site
```

## usage

```ts
import { SiteStandardPublication } from '@atcute/standard-site';
import { is } from '@atcute/lexicons';

const publication: SiteStandardPublication.Main = {
	$type: 'site.standard.publication',
	name: 'my blog',
	url: 'https://example.standard.site',
};

is(SiteStandardPublication.mainSchema, publication);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// file: tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/standard-site"],
	},
}
```

```ts
// file: env.d.ts
/// <reference types="@atcute/standard-site" />
```

```ts
// file: index.ts
import type {} from '@atcute/standard-site';
```

### with `@atcute/lex-cli`

when building your own lexicons that reference standard.site types, configure lex-cli to import from
this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/standard-site'],
});
```
