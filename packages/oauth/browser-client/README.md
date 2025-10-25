# @atcute/oauth-browser-client

minimal OAuth browser client implementation for AT Protocol.

- **only the bare minimum**: enough code to get authentication reasonably working, with only one
  happy path is supported (only ES256 keys for DPoP. PKCE and DPoP-bound PAR is required.)
- **does not use IndexedDB**: makes the library work under Safari's lockdown mode, and has less
  maintenance headache overall, but it also means this is "less secure" (it won't be able to use
  non-exportable keys as recommended by [DPoP specification][idb-dpop-spec].)
- **not well-tested**: it has been used in personal projects and by friends for quite some time, but
  hasn't seen any use outside of that. using the [reference implementation][oauth-atproto-lib] is
  recommended if you are unsure about the implications presented here.

[idb-dpop-spec]: https://datatracker.ietf.org/doc/html/rfc9449#section-2-4
[oauth-atproto-lib]: https://npm.im/@atproto/oauth-client-browser

## usage

### setup

initialize the client by importing and calling `configureOAuth` with the client ID and redirect URL,
along with the resolvers that will be used to resolve and verify account details. this call should
be placed before any other calls you make with this library.

```ts
import { configureOAuth, defaultIdentityResolver } from '@atcute/oauth-browser-client';

import {
	CompositeDidDocumentResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	XrpcHandleResolver,
} from '@atcute/identity-resolver';

configureOAuth({
	metadata: {
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uri: 'https://example.com/oauth/callback',
	},
	identityResolver: defaultIdentityResolver({
		// AT Protocol handles resolve via DNS TXT record or HTTP well-known endpoints.
		// since web apps lack direct DNS access and face CORS restrictions, we're using
		// Bluesky's AppView for this example.
		//
		// NOTE: Bluesky may log handle resolutions and requester info per their privacy
		// policy. consider the privacy implications of this arrangement and change this
		// setup if unsuitable for your use case.
		handleResolver: new XrpcHandleResolver({ serviceUrl: 'https://public.api.bsky.app' }),

		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver(),
			},
		}),
	}),
});
```

### starting an authorization flow

we can start authorization by calling `createAuthorizationUrl` with the intended account's
identifier or service along with the scope of the authorization, which should either match the one
in your client metadata, or a reduced set of it.

```ts
import { createAuthorizationUrl } from '@atcute/oauth-browser-client';

const authUrl = await createAuthorizationUrl({
	target: { type: 'account', identifier: 'mary.my.id' },
	//   or { type: 'pds', serviceUrl: 'https://bsky.social' }
	scope: 'atproto transition:generic transition:chat.bsky',
});

// recommended to wait for the browser to persist local storage before proceeding
await sleep(200);

// redirect the user to sign in and authorize the app
window.location.assign(authUrl);

// if this is on an async function, ideally the function should never ever resolve.
// the only way it should resolve at this point is if the user aborted the authorization
// by returning back to this page (thanks to back-forward page caching)
await new Promise((_resolve, reject) => {
	const listener = () => {
		reject(new Error(`user aborted the login request`));
	};

	window.addEventListener('pageshow', listener, { once: true });
});
```

### finalizing authorization

once the user has been redirected to your redirect URL, we can call `finalizeAuthorization` with the
parameters that have been provided.

```ts
import { XRPC } from '@atcute/client';
import { OAuthUserAgent, finalizeAuthorization } from '@atcute/oauth-browser-client';

// `createAuthorizationUrl` asks for the server to redirect here with the
// parameters assigned in the hash, not the search string.
const params = new URLSearchParams(location.hash.slice(1));

// this is optional, but after retrieving the parameters, we should ideally
// scrub it from history to prevent this authorization state to be replayed,
// just for good measure.
history.replaceState(null, '', location.pathname + location.search);

// you'd be given a session object that you can then pass to OAuthUserAgent!
const session = await finalizeAuthorization(params);

// now you can start making requests!
const agent = new OAuthUserAgent(session);

// pass it onto the XRPC so you can make RPC calls with the PDS.
{
	const rpc = new XRPC({ handler: agent });

	const { data } = await rpc.get('com.atproto.identity.resolveHandle', {
		params: {
			handle: 'mary.my.id',
		},
	});
}

// or, use it directly!
{
	const response = await agent.handle('/xrpc/com.atproto.identity.resolveHandle?handle=mary.my.id');
}
```

the `session` object returned by `finalizeAuthorization` should not be stored anywhere else, as it
is already persisted in the internal database. you are expected to keep track of who's signed in and
who was last signed in for your own UI, as the sessions stored by the database is not guaranteed to
be permanent (mostly if they don't come with a refresh token.)

### resuming existing sessions

you can resume existing sessions by calling `getSession` with the DID identifier you intend to
resume.

```ts
import { XRPC } from '@atcute/client';
import { OAuthUserAgent, getSession } from '@atcute/oauth-browser-client';

const session = await getSession('did:plc:ia76kvnndjutgedggx2ibrem', { allowStale: true });

const agent = new OAuthUserAgent(session);
const rpc = new XRPC({ handler: agent });
```

### removing sessions

you can manually remove sessions via `deleteStoredSession`, but ideally, you should revoke the token
first before doing so.

```ts
import { OAuthUserAgent, deleteStoredSession, getSession } from '@atcute/oauth-browser-client';

const did = 'did:plc:ia76kvnndjutgedggx2ibrem';

try {
	const session = await getSession(did, { allowStale: true });
	const agent = new OAuthUserAgent(session);

	await agent.signOut();
} catch (err) {
	// `signOut` also deletes the session, we only serve as fallback if it fails.
	deleteStoredSession(did);
}
```

## confidential client mode (optional)

by default, `@atcute/oauth-browser-client` operates as a **public client**, which means it cannot
securely store credentials. this results in shorter session lifetimes enforced by authorization
servers.

if you want longer-lived sessions and better security controls, you can enable **confidential client
mode** by setting up a client assertion backend service.

### how it works

the
[client assertion backend pattern](https://github.com/bluesky-social/proposals/tree/main/0010-client-assertion-backend)
allows browser apps to act as confidential clients:

1. your browser app generates a DPoP key (this already happens automatically)
2. when requesting tokens, the browser sends a DPoP proof to your backend service
3. your backend validates the proof and returns a signed client assertion (JWT) that's
   cryptographically bound to the DPoP key via the `cnf` (confirmation) claim
4. the browser includes both the client assertion and DPoP proof in token requests
5. the authorization server verifies the binding and issues longer-lived tokens

### setup

configure the client with a function to fetch client assertions from your backend:

```ts
import { configureOAuth } from '@atcute/oauth-browser-client';

configureOAuth({
	metadata: {
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uri: 'https://example.com/oauth/callback',
	},
	// enable confidential client mode with your custom backend:
	fetchClientAssertion: async ({ jkt, createDpopProof, aud }) => {
		// Create DPoP proof for authenticating to your backend
		const dpop = await createDpopProof('https://example.com/api/client-assertion');

		// Call your backend endpoint (design your own API format)
		const response = await fetch('https://example.com/api/client-assertion', {
			method: 'POST',
			headers: { dpop: dpop },
			body: JSON.stringify({ jkt, aud }),
		});

		const data = await response.json();
		return {
			client_assertion: data.assertion,
			client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
		};
	},
});
```

the backend API format is up to you - there's no standardized spec. design it however works best for
your infrastructure (authentication, request format, error handling, etc.).

the library will automatically:

- calculate JWK thumbprints for DPoP keys
- provide a `createDpopProof()` function for backend authentication
- request client assertions when making token requests

**important**: if you configure `fetchClientAssertion`, your backend **must** be available. there is
no fallback to public client mode, because your OAuth client metadata will declare you as a
confidential client, and authorization servers will reject requests without client assertions.

### backend requirements

your backend service needs to:

1. accept POST requests with DPoP proofs in the `DPoP` header
2. validate the incoming DPoP proof
3. generate and sign a client assertion JWT with:
   - standard claims: `iss`, `sub` (both should be your `client_id`), `aud` (authorization server
     issuer), `exp`, `jti`
   - **crucial**: include `cnf: { jkt }` claim with the JWK thumbprint of the DPoP key
4. return `{ "client_assertion": "<signed-jwt>" }`

additionally:

- enforce CORS to only allow requests from your frontend origin
- never cache responses (client assertions should be fresh)
- optionally track devices via DPoP keys and refuse assertions for suspicious sessions

### client metadata updates

your OAuth client metadata document must also be updated for confidential clients:

```json
{
	"client_id": "https://example.com/oauth-client-metadata.json",
	"client_name": "My App",
	"redirect_uris": ["https://example.com/oauth/callback"],
	"scope": "atproto transition:generic",
	"token_endpoint_auth_method": "private_key_jwt",
	"jwks_uri": "https://example.com/oauth-jwks.json"
}
```

the `jwks_uri` should expose the public keys used to sign client assertions (not the DPoP keys!).

### benefits

- **longer sessions**: authorization servers grant extended refresh token lifetimes to confidential
  clients
- **better security**: your backend can revoke sessions, track devices, and enforce policies
- **mass revocation**: rotate your backend keypair to instantly invalidate all sessions

## additional guide

### configuring your Vite project

you might want to configure the server options in your Vite config so you'll never end up visiting
your app in `localhost`, which is specifically forbidden by AT Protocol's OAuth, let's change it so
it'll always use `127.0.0.1`:

```ts
/// vite.config.ts
import { defineConfig } from 'vite';

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 12520;

export default defineConfig({
	server: {
		host: SERVER_HOST,
		port: SERVER_PORT,
	},
});
```

additionally, to make it easier to develop locally and deploy to production, you should consider
adding a plugin that'll inject the necessary values for you through environment variables:

```ts
/// vite.config.ts
import metadata from './public/oauth-client-metadata.json' with { type: 'json' };

export default defineConfig({
	// ...

	plugins: [
		// injects OAuth-related environment variables
		{
			config(_conf, { command }) {
				if (command === 'build') {
					process.env.VITE_OAUTH_CLIENT_ID = metadata.client_id;
					process.env.VITE_OAUTH_REDIRECT_URI = metadata.redirect_uris[0];
				} else {
					const redirectUri = (() => {
						const url = new URL(metadata.redirect_uris[0]);
						return `http://${SERVER_HOST}:${SERVER_PORT}${url.pathname}`;
					})();

					const clientId =
						`http://localhost` +
						`?redirect_uri=${encodeURIComponent(redirectUri)}` +
						`&scope=${encodeURIComponent(metadata.scope)}`;

					process.env.VITE_DEV_SERVER_PORT = '' + SERVER_PORT;
					process.env.VITE_OAUTH_CLIENT_ID = clientId;
					process.env.VITE_OAUTH_REDIRECT_URI = redirectUri;
				}

				process.env.VITE_CLIENT_URI = metadata.client_uri;
				process.env.VITE_OAUTH_SCOPE = metadata.scope;
			},
		},
	],
});
```

we'll augment the type declarations to get type-checking on it:

```ts
/// src/vite-env.d.ts

interface ImportMetaEnv {
	readonly VITE_DEV_SERVER_PORT?: string;
	readonly VITE_CLIENT_URI: string;
	readonly VITE_OAUTH_CLIENT_ID: string;
	readonly VITE_OAUTH_REDIRECT_URI: string;
	readonly VITE_OAUTH_SCOPE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
```

et voilà! you can now use this to configure the client.

```ts
configureOAuth({
	metadata: {
		client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
		redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
	},
	// ...
});

// ... later during sign-in process
const authUrl = await createAuthorizationUrl({
	// ...
	scope: import.meta.env.VITE_OAUTH_SCOPE,
});
```

adjust the code here as necessary, the plugin adds more environment variables than what is actually
needed, you can remove them if you don't think you'd need it.
