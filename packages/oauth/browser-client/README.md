# @atcute/oauth-browser-client

minimal OAuth browser client implementation for AT Protocol.

- **only the bare minimum**: enough code to get authentication reasonably working, with only one
  happy path is supported (only ES256 keys for DPoP. PKCE and DPoP-bound PAR is required.)
- **does not use IndexedDB**: makes the library work under Safari's lockdown mode, and has less
  [maintenance headache][indexeddb-woes] overall, but it also means this is "less secure" (it won't
  be able to use non-exportable keys as recommended by [DPoP specification][idb-dpop-spec].)
- **no independent DNS/HTTP handle checks**: the default handle resolver makes use of Bluesky's
  AppView to retrieve the correct DID identifier. you should be able to write your own resolver
  function that'll resolve via DNS-over-HTTPS or via other PDSes.
- **not well-tested**: it has been used in personal projects for quite some time, but hasn't seen
  any use outside of that. using the [reference implementation][oauth-atproto-lib] is recommended if
  you are unsure about the implications presented here.

[indexeddb-woes]: https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a
[idb-dpop-spec]: https://datatracker.ietf.org/doc/html/rfc9449#section-2-4
[oauth-atproto-lib]: https://npm.im/@atproto/oauth-client-browser

## usage

### setup

initialize the client by importing and calling `configureOAuth` with the client ID and redirect URL.
this call should be placed before any other calls you make with this library.

```ts
import { configureOAuth } from '@atcute/oauth-browser-client';

configureOAuth({
	metadata: {
		client_id: 'https://example.com/oauth/client-metadata.json',
		redirect_uri: 'https://example.com/oauth/callback',
	},
});
```

### starting an authorization flow

if your application involves asking for the user's handle or DID, you can use `resolveFromIdentity`
which resolves the user's identity to get its PDS, and the metadata of its authorization server.

```ts
import { resolveFromIdentity } from '@atcute/oauth-browser-client';

const { identity, metadata } = await resolveFromIdentity('mary.my.id');
```

alternatively, if it involves asking for the user's PDS, then you can use `resolveFromService` which
just grabs the authorization server metadata.

```ts
import { resolveFromService } from '@atcute/oauth-browser-client';

const { metadata } = await resolveFromService('bsky.social');
```

we can then proceed with authorization by calling `createAuthorizationUrl` with the resolved
`metadata` (and `identity`, if using `resolveFromIdentity`) along with the scope of the
authorization, which should either match the one in your client metadata, or a reduced set of it.

```ts
import { createAuthorizationUrl } from '@atcute/oauth-browser-client';

// passing `identity` is optional,
// it allows for the login form to be autofilled with the user's handle or DID
const authUrl = await createAuthorizationUrl({
	metadata: metadata,
	identity: identity,
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
const rpc = new XRPC({ handler: agent });
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
import metadata from './public/oauth/client-metadata.json' with { type: 'json' };

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
});

// ... later during sign-in process
const authUrl = await createAuthorizationUrl({
	metadata: metadata,
	identity: identity,
	scope: import.meta.env.VITE_OAUTH_SCOPE,
});
```

adjust the code here as necessary, the plugin adds more environment variables than what is actually
needed, you can remove them if you don't think you'd need it.
