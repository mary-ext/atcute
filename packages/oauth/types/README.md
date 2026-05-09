# @atcute/oauth-types

OAuth types and schemas for AT Protocol.

```sh
npm install @atcute/oauth-types
```

## usage

### building client metadata

```ts
import { buildClientMetadata } from '@atcute/oauth-types';
import { Keyset } from '@atcute/oauth-keyset';

const metadata = buildClientMetadata(
	{
		client_id: 'https://example.com/client-metadata.json',
		redirect_uris: ['https://example.com/callback'],
		scope: 'atproto transition:generic',
		client_name: 'my app',
	},
	keyset,
);
```

### validating data

```ts
import {
	confidentialClientMetadataSchema,
	oauthTokenResponseSchema,
	atprotoAuthorizationServerMetadataSchema,
} from '@atcute/oauth-types';
import * as v from 'valibot';

// validate client metadata
const result = v.safeParse(confidentialClientMetadataSchema, input);
if (result.success) {
	console.log(result.output);
}

// validate token response
const tokenResult = v.safeParse(oauthTokenResponseSchema, response);

// validate authorization server metadata
const asResult = v.safeParse(atprotoAuthorizationServerMetadataSchema, metadata);
```
