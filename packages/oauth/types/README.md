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

// validate client metadata
const result = confidentialClientMetadataSchema.try(input);
if (result.ok) {
	console.log(result.value);
}

// validate token response
const tokenResult = oauthTokenResponseSchema.try(response);

// validate authorization server metadata
const asResult = atprotoAuthorizationServerMetadataSchema.try(metadata);
```
