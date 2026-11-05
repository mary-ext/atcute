# @atcute/tangled

[Tangled](https://tangled.org/) (org.tangled.\*, sh.tangled.\*) schema definitions

```sh
npm install @atcute/tangled
```

## usage

```ts
import { OrgTangledFeedStar } from '@atcute/tangled';
import { is } from '@atcute/lexicons';

const star: OrgTangledFeedStar.Main = {
	$type: 'org.tangled.feed.star',
	subject: {
		$type: 'org.tangled.feed.star#repo',
		identity: 'did:plc:wshs7t2adsemcrrd4snkeqli',
	},
	createdAt: '2025-05-14T01:29:08Z',
};

is(OrgTangledFeedStar.mainSchema, star);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/tangled"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/tangled" />
```

```ts
// index.ts
import type {} from '@atcute/tangled';
```

now all the XRPC operations should be visible in the client

### with `@atcute/lex-cli`

when building your own lexicons that reference Tangled types, configure lex-cli to import from this
package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/tangled'],
});
```
