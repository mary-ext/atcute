# @atcute/pckt

[pckt](https://pckt.blog) (blog.pckt.\*) schema definitions

## usage

```ts
import { BlogPcktPublication } from '@atcute/pckt';
import { is } from '@atcute/lexicons';

const publication: BlogPcktPublication.Main = {
	$type: 'blog.pckt.publication',
	name: 'my blog',
	basePath: 'https://example.pckt.blog',
	createdAt: new Date().toISOString(),
};

is(BlogPcktPublication.mainSchema, publication);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// file: tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/pckt"],
	},
}
```

```ts
// file: env.d.ts
/// <reference types="@atcute/pckt" />
```

```ts
// file: index.ts
import type {} from '@atcute/pckt';
```

### with `@atcute/lex-cli`

when building your own lexicons that reference pckt types, configure lex-cli to import from this
package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/pckt'],
});
```
