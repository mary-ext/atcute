# @atcute/oauth-node-client example

this example demonstrates OAuth authentication for AT Protocol using `@atcute/oauth-node-client`.

## requirements

confidential OAuth clients must be accessible via **https** since the authorization server (e.g.
Bluesky's PDS) needs to fetch the client's JWKS from the client_id URL.

for local development, use a tunneling service like [ngrok](https://ngrok.com/),
[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/),
or similar.

## setup

install dependencies:

```sh
bun install
```

create `.env.local` and generate a fresh private key:

```sh
bun run setup:env
```

then edit `.env.local` and set `PUBLIC_URL` to your public https url.

## running with ngrok

1. start ngrok tunnel:

```sh
ngrok http 3000
```

2. copy the https URL (e.g. `https://abc123.ngrok.io`)

3. set `PUBLIC_URL` in `.env.local`, or start the server with the public URL:

```sh
PUBLIC_URL=https://abc123.ngrok.io bun run dev
```

4. open the ngrok URL in your browser

## environment variables

- `PUBLIC_URL` (required) - the https URL where this app is accessible
- `PORT` (optional) - local listen port (default: `3000`)
- `PRIVATE_KEY_JWK` (required) - JSON Web Key used for client authentication (`private_key_jwt`)
- `COOKIE_SECRET` (optional) - secret for signed cookies. `setup:env` generates one; if unset, a
  secret is derived from `PRIVATE_KEY_JWK`

## generating a private key

the `setup:env` script generates a fresh key and writes it into `.env.local`. to rotate it, run:

```sh
bun run setup:env
```

for production, generate and store a persistent key:

```js
import { exportPrivateJwk, generateClientAssertionKey } from '@atcute/oauth-node-client';

const key = await generateClientAssertionKey('main', 'ES256');
const jwk = await exportPrivateJwk(key);
console.log(JSON.stringify(jwk));
```

then set `PRIVATE_KEY_JWK` to the output.

## routes

- `/` - home page with login form
- `/oauth/login` - starts OAuth authorization flow
- `/oauth/callback` - OAuth callback handler
- `/protected` - example protected resource (fetches session info)
- `/logout` - revokes tokens and clears session
- `/client-metadata.json` - serves client metadata for discovery
- `/jwks.json` - serves client jwks (public keys) for discovery
