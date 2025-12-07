# @atcute/microcosm

[Microcosm](https://www.microcosm.blue/) (blue.microcosm.\*, com.bad-example.\*) schema definitions

```sh
npm install @atcute/microcosm
```

Microcosm is a collection of services and independent community-run infrastructure for AT Protocol,
including:

- [Constellation](https://constellation.microcosm.blue/): global backlink index for tracking social
  interactions
- [Slingshot](https://slingshot.microcosm.blue/): edge record cache for improved performance and
  reliability

## usage

```ts
import { Client, ok, simpleFetchHandler } from '@atcute/client';
import type {} from '@atcute/microcosm';

{
	const constellation = new Client({
		handler: simpleFetchHandler({ service: 'https://constellation.microcosm.blue' }),
	});

	const backlinks = await ok(
		constellation.get('blue.microcosm.links.getBacklinks', {
			params: {
				subject: 'at://did:plc:example/app.bsky.feed.post/123',
				source: 'app.bsky.feed.like:subject.uri',
				limit: 50,
			},
		}),
	);

	console.log(backlinks.total);
	// -> 42
}

{
	const slingshot = new Client({
		handler: simpleFetchHandler({ service: 'https://slingshot.microcosm.blue' }),
	});

	const resolved = await ok(
		slingshot.get('com.bad-example.identity.resolveMiniDoc', {
			params: {
				identifier: 'microcosm.blue',
			},
		}),
	);

	console.log(resolved.pds);
	// -> 'https://dapperling.us-west.host.bsky.network'
}
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/microcosm"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/microcosm" />
```

```ts
// index.ts
import type {} from '@atcute/microcosm';
```

now all the XRPC operations should be visible in the client

### with `@atcute/lex-cli`

when building your own lexicons that reference Microcosm types, configure lex-cli to import from
this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/microcosm'],
});
```
