# @atcute/oauth-browser-client

minimal OAuth browser client for AT Protocol.

```sh
npm install @atcute/oauth-browser-client
```

## client metadata

your app needs an OAuth client metadata document hosted at a public URL. this tells authorization
servers about your app:

```json
{
	"client_id": "https://example.com/oauth-client-metadata.json",
	"client_name": "My App",
	"client_uri": "https://example.com",
	"redirect_uris": ["https://example.com/oauth/callback"],
	"scope": "atproto transition:generic",
	"grant_types": ["authorization_code", "refresh_token"],
	"response_types": ["code"],
	"token_endpoint_auth_method": "none",
	"application_type": "web",
	"dpop_bound_access_tokens": true
}
```

the `client_id` must be the URL where this document is hosted. see the
[OAuth client metadata spec](https://docs.bsky.app/docs/advanced-guides/oauth-client#client-metadata)
for all available fields.

## usage

### configuration

call `configureOAuth` before using any other functions from this library:

```ts
import { configureOAuth } from '@atcute/oauth-browser-client';

import {
	CompositeDidDocumentResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from '@atcute/identity-resolver';

configureOAuth({
	metadata: {
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uri: 'https://example.com/oauth/callback',
	},
	identityResolver: new LocalActorResolver({
		handleResolver: new XrpcHandleResolver({
			serviceUrl: 'https://public.api.bsky.app',
		}),
		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver(),
			},
		}),
	}),
});
```

> [!NOTE]  
> this example uses Bluesky's AppView for handle resolution since web apps lack direct DNS access.
> Bluesky may log handle resolutions per their privacy policy - consider the implications for your
> use case.

### starting authorization

```ts
import { createAuthorizationUrl } from '@atcute/oauth-browser-client';

const authUrl = await createAuthorizationUrl({
	target: { type: 'account', identifier: 'mary.my.id' },
	scope: 'atproto transition:generic transition:chat.bsky',
});

await sleep(200); // let browser persist local storage
window.location.assign(authUrl);
```

### finalizing authorization

on your redirect URL, extract the parameters and finalize:

```ts
import { Client } from '@atcute/client';
import { OAuthUserAgent, finalizeAuthorization } from '@atcute/oauth-browser-client';

// server redirects with params in hash, not search string
const params = new URLSearchParams(location.hash.slice(1));

// scrub params from URL to prevent replay
history.replaceState(null, '', location.pathname + location.search);

const { session } = await finalizeAuthorization(params);
const agent = new OAuthUserAgent(session);
const rpc = new Client({ handler: agent });

const { data } = await rpc.get('com.atproto.identity.resolveHandle', {
	params: { handle: 'mary.my.id' },
});
```

the session is persisted internally - don't store it elsewhere. track signed-in DIDs yourself for
your UI, as sessions without refresh tokens may expire.

### resuming sessions

```ts
import { OAuthUserAgent, getSession } from '@atcute/oauth-browser-client';

const session = await getSession('did:plc:ia76kvnndjutgedggx2ibrem', {
	allowStale: true,
});
const agent = new OAuthUserAgent(session);
```

### signing out

```ts
import { OAuthUserAgent, deleteStoredSession, getSession } from '@atcute/oauth-browser-client';

const did = 'did:plc:ia76kvnndjutgedggx2ibrem';

try {
	const session = await getSession(did, { allowStale: true });
	const agent = new OAuthUserAgent(session);
	await agent.signOut();
} catch {
	deleteStoredSession(did); // fallback if signOut fails
}
```

## confidential client mode

by default, this library operates as a **public client** with shorter session lifetimes. for
longer-lived sessions, set up a [client assertion backend][client-assertion-backend] to enable
**confidential client mode**.

[client-assertion-backend]:
	https://github.com/bluesky-social/proposals/tree/main/0010-client-assertion-backend

add `fetchClientAssertion` to your config. the backend API is entirely up to you - this is just one
example:

```ts
configureOAuth({
	// ... existing config

	async fetchClientAssertion({ aud, createDpopProof }) {
		const htu = 'https://example.com/api/client-assertion';
		const dpop = await createDpopProof(htu);

		const response = await fetch(htu, {
			method: 'POST',
			headers: { dpop, 'content-type': 'application/json' },
			body: JSON.stringify({ aud }),
		});

		const data = await response.json();
		return {
			client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
			client_assertion: data.assertion,
		};
	},
});
```

your backend validates the dpop proof and signs a client assertion jwt containing `iss`, `sub` (both
your client id), `aud` (authorization server), `exp`, `jti` (unique nonce), and `cnf: { jkt }` (the
allowed key thumbprint derived from the proof).

update your client metadata for confidential mode - replace `token_endpoint_auth_method` with
`private_key_jwt`, add `token_endpoint_auth_signing_alg: "ES256"`, and add a `jwks_uri` pointing to
your public keys.

## local development with Vite

AT Protocol OAuth forbids `localhost` - use `127.0.0.1` instead:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import metadata from './public/oauth-client-metadata.json' with { type: 'json' };

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 12520;

export default defineConfig({
	server: { host: SERVER_HOST, port: SERVER_PORT },
	plugins: [
		{
			name: 'oauth-envs',
			config(_conf, { command }) {
				if (command === 'build') {
					process.env.VITE_OAUTH_CLIENT_ID = metadata.client_id;
					process.env.VITE_OAUTH_REDIRECT_URI = metadata.redirect_uris[0];
				} else {
					const redirectUri = `http://${SERVER_HOST}:${SERVER_PORT}${new URL(metadata.redirect_uris[0]).pathname}`;
					process.env.VITE_OAUTH_CLIENT_ID =
						`http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}` +
						`&scope=${encodeURIComponent(metadata.scope)}`;
					process.env.VITE_OAUTH_REDIRECT_URI = redirectUri;
				}
				process.env.VITE_OAUTH_SCOPE = metadata.scope;
			},
		},
	],
});
```

then use environment variables in your code:

```ts
configureOAuth({
	metadata: {
		client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
		redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
	},
	// ...
});
```

## caveats

- **minimal implementation**: only ES256 DPoP keys, requires PKCE and DPoP-bound PAR
- **no IndexedDB**: works in Safari lockdown mode but can't use non-exportable keys as [recommended
  by DPoP spec][dpop-spec]
- **limited testing**: works in personal projects but consider the [reference
  implementation][oauth-atproto-lib] for production

[dpop-spec]: https://datatracker.ietf.org/doc/html/rfc9449#section-2-4
[oauth-atproto-lib]: https://npm.im/@atproto/oauth-client-browser
