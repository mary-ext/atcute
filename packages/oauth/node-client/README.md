# @atcute/oauth-node-client

atproto OAuth client for Node.js (plus Deno, Bun, and other server runtimes) and
[WebExtensions](#webextensions).

supports both:

- **confidential clients** - authenticate with `private_key_jwt`, longer session lifetimes (up to
  180 days), requires key management and hosted metadata
- **public clients** - no authentication (`token_endpoint_auth_method: 'none'`), shorter sessions (2
  weeks max), simpler setup for CLI tools and local development

```sh
npm install @atcute/oauth-node-client
```

## confidential clients

examples below use Hono, but any web framework works.

### key management

confidential clients require a persistent private key, so we need one to be generated.

one pattern is to keep a committed `.env` with empty placeholders and generate a developer-specific
`.env.local` that is never checked in:

1. create `.env` with an empty value:

```dotenv
PRIVATE_KEY_JWK=
```

2. add `scripts/setup-env.mjs`:

```js
import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { generateClientAssertionKey } from '@atcute/oauth-node-client';

const ensureEnvLocal = async () => {
	const envPath = resolve(process.cwd(), '.env');
	const envLocalPath = resolve(process.cwd(), '.env.local');

	if (!existsSync(envLocalPath)) {
		await copyFile(envPath, envLocalPath);
	}

	return envLocalPath;
};

const upsertEnvVar = (input, key, value) => {
	const line = `${key}=${value}`;
	const re = new RegExp(`^${key}=.*$`, 'm');

	if (re.test(input)) {
		const match = input.match(re);
		const current = match ? match[0].slice(key.length + 1) : '';
		const trimmed = current.trim();

		if (trimmed === '' || trimmed === `''` || trimmed === `""`) {
			return input.replace(re, line);
		}

		return input;
	}

	const suffix = input.endsWith('\n') || input.length === 0 ? '' : '\n';
	return `${input}${suffix}${line}\n`;
};

const envLocalPath = await ensureEnvLocal();
const envLocal = await readFile(envLocalPath, 'utf8');

// generateClientAssertionKey returns a JWK directly
const jwk = await generateClientAssertionKey('main', 'ES256');
const jwkJson = JSON.stringify(jwk);
const updated = upsertEnvVar(envLocal, 'PRIVATE_KEY_JWK', `'${jwkJson}'`);

if (updated !== envLocal) {
	await writeFile(envLocalPath, updated);
	console.log(`updated ${envLocalPath}`);
} else {
	console.log(`no changes to ${envLocalPath}`);
}
```

3. run it:

```sh
node scripts/setup-env.mjs
```

4. create a keyset at runtime:

```ts
import type { ClientAssertionPrivateJwk } from '@atcute/oauth-node-client';

// JWKs can be used directly - no import step needed
const keyset = [JSON.parse(process.env.PRIVATE_KEY_JWK!) as ClientAssertionPrivateJwk];
```

### create an OAuth client

```ts
import {
	MemoryStore,
	OAuthClient,
	scope,
	type ClientAssertionPrivateJwk,
} from '@atcute/oauth-node-client';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';

const oauth = new OAuthClient({
	metadata: {
		// this must be the URL where you serve `oauth.metadata`.
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uris: ['https://example.com/oauth/callback'],
		// scopes; shown here is an example for a full-featured Bluesky client.
		scope: [
			scope.include({
				nsid: 'app.bsky.authFullApp',
				aud: 'did:web:api.bsky.app#bsky_appview',
			}),
			scope.include({
				nsid: 'chat.bsky.authFullChatClient',
				aud: 'did:web:api.bsky.chat#bsky_chat',
			}),

			scope.rpc({ lxm: ['com.atproto.moderation.createReport'], aud: '*' }),
			scope.blob({ accept: ['image/*', 'video/*'] }),
			scope.account({ attr: 'email', action: 'manage' }),
			scope.identity({ attr: 'handle' }),
		],
		// optional: if set, this must be the URL where you serve `oauth.jwks`.
		// must be same-origin as client_id. if omitted, `oauth.metadata` will inline jwks instead.
		jwks_uri: 'https://example.com/jwks.json',
	},

	// JWKs can be used directly - no import step needed
	keyset: [JSON.parse(process.env.PRIVATE_KEY_JWK!) as ClientAssertionPrivateJwk],

	stores: {
		// sessions are keyed by DID - should be durable across restarts.
		sessions: new MemoryStore(),
		// states are keyed by OAuth state value - should have ~10 minute TTL.
		// MemoryStore works for development; use Redis or similar in production.
		states: new MemoryStore(),
	},
	// optional: custom lock for coordinating token refresh across processes.
	// defaults to in-memory, which works for single-process deployments.
	// for multi-process/clustered deployments, provide a distributed lock
	// (e.g., Redis-based) to prevent concurrent refresh for the same session.
	async requestLock(name, fn) {
		// ...
	},

	actorResolver: new LocalActorResolver({
		handleResolver: new CompositeHandleResolver({
			methods: {
				dns: new NodeDnsHandleResolver(),
				http: new WellKnownHandleResolver(),
			},
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

### serve metadata and jwks

the PDS/authorization server fetches your client metadata and JWKS from the URLs you advertise:

```ts
app.get('/oauth-client-metadata.json', (c) => c.json(oauth.metadata));
app.get('/jwks.json', (c) => c.json(oauth.jwks));
```

### start authorization

```ts
app.get('/login', async (c) => {
	const { url } = await oauth.authorize({
		target: { type: 'account', identifier: 'mary.my.id' },
		state: { returnTo: '/protected' },
	});

	return c.redirect(url.toString());
});
```

### handle the callback

pass the callback query params to `callback()`. if your framework only gives you a path, combine it
with your public origin (the same origin used in your `redirect_uri`):

```ts
app.get('/oauth/callback', async (c) => {
	const callbackUrl = new URL(c.req.url);
	const { session, state } = await oauth.callback(callbackUrl.searchParams);

	// store session.did in your own cookie/session so you know who is signed in.
	// oauth tokens are stored in your session store - don't store them elsewhere.
	const did = session.did;
	const returnTo = (state as { returnTo?: string } | undefined)?.returnTo ?? '/';

	void did;
	return c.redirect(returnTo);
});
```

### session restoration

restore a session by DID. this will refresh tokens if needed.

```ts
import { Client } from '@atcute/client';

const session = await oauth.restore(did);
const client = new Client({ handler: session });

const { data } = await client.get('com.atproto.server.getSession');
```

### signing out

```ts
await oauth.revoke(did);
```

or, if you already have an `OAuthSession`:

```ts
await session.signOut();
```

## public clients

public clients don't require key management or hosted metadata. they're ideal for CLI tools, local
development, and native apps. the tradeoff is shorter session lifetimes (2 weeks max vs 180 days for
confidential clients).

### loopback clients

loopback clients use `http://localhost` as their origin, which authorization servers recognize as a
public client. no client registration or hosted metadata is required - the library builds the
`client_id` automatically from your redirect URIs and scopes.

```ts
import { MemoryStore, OAuthClient, scope, type StoredState } from '@atcute/oauth-node-client';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';

// use any available port for the callback server
const port = 8080;
const redirectUri = `http://127.0.0.1:${port}/callback`;

const oauth = new OAuthClient({
	metadata: {
		// no client_id needed - built automatically as:
		// http://localhost?redirect_uri=http://127.0.0.1:8080/callback&scope=...
		redirect_uris: [redirectUri],
		scope: [scope.rpc({ lxm: ['app.bsky.actor.getProfile'], aud: '*' })],
	},
	// no keyset - this makes it a public client

	stores: {
		sessions: new MemoryStore(),
		states: new MemoryStore<string, StoredState>({ maxSize: 10, ttl: 10 * 60_000 }),
	},

	actorResolver: new LocalActorResolver({
		handleResolver: new CompositeHandleResolver({
			methods: {
				dns: new NodeDnsHandleResolver(),
				http: new WellKnownHandleResolver(),
			},
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

loopback redirect URIs must use `127.0.0.1` or `[::1]` (not `localhost`). the port can be any
available port - authorization servers ignore the port when matching loopback redirect URIs per
RFC 8252.

see the [node-client-public-example](../node-client-public-example) package for a complete CLI
example.

### discoverable public clients

for public clients that need a discoverable `client_id` (e.g., mobile apps or web apps without a
backend), provide a `client_id` URL pointing to hosted metadata:

```ts
const oauth = new OAuthClient({
	metadata: {
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uris: ['https://example.com/callback'],
		scope: 'atproto',
	},
	stores: { /* ... */ },
	actorResolver: /* ... */,
});
```

the hosted metadata should set `token_endpoint_auth_method: 'none'` and omit `jwks`/`jwks_uri`.

## custom stores

for production deployments, implement the `Store` interface with a shared store like Redis:

```ts
import type { OAuthClientStores } from '@atcute/oauth-node-client';

const stores: OAuthClientStores = {
	sessions: {
		async get(did, options) {
			// ...
		},
		async set(did, session) {
			// ...
		},
		async delete(did) {
			// ...
		},
		async clear() {},
	},
	states: {
		async get(stateId, options) {
			// ...
		},
		async set(stateId, state) {
			// ...
		},
		async delete(stateId) {
			// ...
		},
		async clear() {},
	},
};
```

## WebExtensions

browser extensions requires acting as a [discoverable public client](#discoverable-public-clients)
and thus requires a public HTTPS origin to host the client metadata and callback page.

```json
{
	"client_id": "https://example.com/oauth-client-metadata.json",
	"client_name": "My App",
	"client_uri": "https://example.com",
	"redirect_uris": ["https://example.com/oauth/callback"],
	"scope": "atproto",
	"grant_types": ["authorization_code", "refresh_token"],
	"response_types": ["code"],
	"token_endpoint_auth_method": "none",
	"application_type": "web",
	"dpop_bound_access_tokens": true
}
```

```ts
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	DohJsonHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';

const oauth = new OAuthClient({
	metadata: {
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uris: ['https://example.com/callback'],
		scope: 'atproto',
	},

	stores: {/* ... */},

	requestLock(name, fn) {
		return navigator.locks.request(name, fn);
	},

	actorResolver: new LocalActorResolver({
		handleResolver: new CompositeHandleResolver({
			methods: {
				dns: new DohJsonHandleResolver(),
				http: new WellKnownHandleResolver(),
			},
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

### redirect URIs

#### bounce page

serve a page at your `redirect_uri` that forwards the query string to the extension:

```html
<script>
	// allowlist your own extension IDs, do not read the target from the URL.
	// firefox uses a different host, see `browser.identity.getRedirectURL()`.
	location.replace('https://<extension-id>.chromiumapp.org/' + location.search);
</script>
```

`launchWebAuthFlow` resolves once the flow reaches that URL:

```ts
const { url } = await oauth.authorize({
	target: { type: 'account', identifier: 'mary.my.id' },
});

const redirect = await chrome.identity.launchWebAuthFlow({
	url: url.toString(),
	interactive: true,
});

const { session } = await oauth.callback(new URL(redirect).searchParams);
```

this needs the `identity` permission.

#### content script

if you cannot add a bounce page, open the authorization URL in a tab and read the result with a
content script matched against your `redirect_uri`:

```ts
// content script
chrome.runtime.sendMessage({ type: 'oauth-callback', search: location.search });

// service worker
chrome.runtime.onMessage.addListener(({ type, search }) => {
	if (type === 'oauth-callback') {
		oauth.callback(new URLSearchParams(search)).then(
			({ session }) => {
				// ...
			},
			(err) => {
				// surface the failure, the tab is already gone
			},
		);
	}
});
```

this needs a host permission for the callback origin, and the content script must be declared in the
manifest.
