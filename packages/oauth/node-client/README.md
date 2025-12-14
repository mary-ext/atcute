# @atcute/oauth-node-client

atproto OAuth client for Node.js (and other server runtimes). this package implements a
**confidential client** that authenticates using `private_key_jwt`.

```sh
npm install @atcute/oauth-node-client
```

## usage

examples below use Hono, but any web framework with `Request`/`Response` style works.

```ts
import { Hono } from 'hono';

const app = new Hono();
```

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

import { exportJwkKey, generatePrivateKey, importJwkKey } from '@atcute/oauth-node-client';

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

const privateKey = await generatePrivateKey('main', 'ES256');
const jwk = await exportJwkKey(privateKey);

// sanity-check that the key parses before writing
await importJwkKey(jwk);

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
import { importJwkKey } from '@atcute/oauth-node-client';

const keyset = await Promise.all([importJwkKey(process.env.PRIVATE_KEY_JWK!)]);
```

### create an OAuth client

```ts
import { MemoryStore, OAuthClient, importJwkKey } from '@atcute/oauth-node-client';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';

const keyset = await Promise.all([importJwkKey(process.env.PRIVATE_KEY_JWK!)]);

const oauth = new OAuthClient({
	metadata: {
		// this must be the URL where you serve `oauth.metadata` (below).
		client_id: 'https://example.com/oauth-client-metadata.json',
		redirect_uris: ['https://example.com/oauth/callback'],
		scope: 'atproto transition:generic',
		// optional: if set, this must be the URL where you serve `oauth.jwks` (below).
		// must be same-origin as client_id. if omitted, `oauth.metadata` will inline jwks instead.
		jwks_uri: 'https://example.com/jwks.json',
	},

	keyset,

	stores: {
		// sessions are keyed by DID - should be durable across restarts.
		// states are keyed by OAuth state value - should have ~10 minute TTL.
		// MemoryStore works for development; use Redis or similar in production.
		sessions: new MemoryStore(),
		states: new MemoryStore(),
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
const rpc = new Client({ handler: session });

const { data } = await rpc.get('com.atproto.server.getSession');
```

### signing out

```ts
await oauth.revoke(did);
```

or, if you already have an `OAuthSession`:

```ts
await session.signOut();
```

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
