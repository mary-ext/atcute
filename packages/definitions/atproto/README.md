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
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/atproto"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/atproto" />
```

```ts
// index.ts
import type {} from '@atcute/atproto';
```

now all the XRPC operations should be visible in the client

```ts
import { Client, simpleFetchHandler } from '@atcute/client';

const client = new Client({ handler: simpleFetchHandler({ service: 'https://bsky.social' }) });

const response = await client.get('com.atproto.server.describeServer');
// ...
```
