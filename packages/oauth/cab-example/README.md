# @atcute/oauth-cab example

this example demonstrates a confidential OAuth browser client using `@atcute/oauth-cab` with
Cloudflare Workers.

## requirements

confidential OAuth clients must be accessible via **https** since the authorization server needs to
fetch the client metadata and JWKS from the client_id URL.

for local development, use a tunneling service like
[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/).

## setup

install dependencies:

```sh
pnpm install
```

generate a fresh private key:

```sh
pnpm run setup:env
```

then edit `.dev.vars` and set `PUBLIC_URL` to your public https URL.

regenerate types:

```sh
pnpm run cf-typegen
```

## running with cloudflared

1. start a quick tunnel:

```sh
cloudflared tunnel --url http://localhost:5173
```

2. copy the https URL (e.g. `https://abc-xyz.trycloudflare.com`)

3. set `PUBLIC_URL` in `.dev.vars`:

```
PRIVATE_KEY_JWK={"kty":"EC",...}
PUBLIC_URL=https://abc-xyz.trycloudflare.com
```

4. regenerate types and start the dev server:

```sh
pnpm run cf-typegen
pnpm run dev
```

5. open the tunnel URL in your browser

## environment variables

- `PRIVATE_KEY_JWK` (required) - JSON Web Key used for client authentication
- `PUBLIC_URL` (required) - the https URL where this app is accessible

## deployment

deploy to Cloudflare Workers:

```sh
pnpm run deploy
```

set secrets on the deployed worker:

```sh
wrangler secret put PRIVATE_KEY_JWK
wrangler secret put PUBLIC_URL
```

## routes

- `/` - home page with login form
- `/oauth/callback` - OAuth callback handler
- `/protected` - example protected resource (fetches session info)
- `/oauth-client-metadata.json` - serves client metadata for discovery
- `/jwks.json` - serves client JWKS (public keys) for discovery
- `/xrpc/dev.atcute.oauth.getClientAssertion` - CAB endpoint
