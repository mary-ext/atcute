# @atcute/atproto

[AT Protocol](https://atproto.com) (com.atproto.\*) schema definitions

## usage

```ts
import { ComAtprotoLabelDefs } from '@atcute/atproto';
import { is } from '@atcute/lexicons';

const label: ComAtprotoLabelDefs.Label = {
	cts: '2024-11-13T04:46:40.254Z',
	neg: false,
	src: 'did:plc:wkoofae5uytcm7bjncmev6n6',
	uri: 'did:plc:ia76kvnndjutgedggx2ibrem',
	val: 'she-it',
	ver: 1,
};

is(ComAtprotoLabelDefs.labelSchema, label);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// file: tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/atproto"],
	},
}
```

```ts
// file: env.d.ts
/// <reference types="@atcute/atproto" />
```

```ts
// file: index.ts
import type {} from '@atcute/atproto';
```

now all the XRPC operations should be visible in the client

```ts
import { Client, simpleFetchHandler } from '@atcute/client';

const client = new Client({ handler: simpleFetchHandler({ service: 'https://bsky.social' }) });

const response = await client.get('com.atproto.server.describeServer');
// ...
```

## with `@atcute/lex-cli`

when building your own lexicons that reference AT Protocol types, configure lex-cli to import from
this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	mappings: [
		{
			nsid: ['com.atproto.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('com.atproto.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/atproto/types/${specifier}` };
			},
		},
	],
});
```
