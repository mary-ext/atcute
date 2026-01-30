# node-client-public-example

a simple CLI demonstrating [`@atcute/oauth-node-client`](../node-client) with a public (loopback)
client.

this example shows how to authenticate with AT Protocol OAuth without needing to set up a
confidential client with keys. it's useful for CLI tools, local development, and testing.

## usage

```bash
# authenticate and show your profile
bun run start alice.bsky.social

# or use a DID
bun run start did:plc:z72i7hdynmk6r22z27h6tvur
```

the CLI will:

1. start a local callback server on a random port
2. print an authorization URL for you to open
3. wait for you to authorize the app
4. fetch and display your profile information

## how it works

loopback clients use `http://localhost` as the client origin, which the OAuth server recognizes as a
public client. no keys or client registration are required.

```typescript
import { OAuthClient, scope } from '@atcute/oauth-node-client';

const oauth = new OAuthClient({
  metadata: {
    // no client_id needed - it's built automatically from redirect_uris and scope
    redirect_uris: ['http://127.0.0.1:PORT/callback'],
    scope: [scope.rpc({ lxm: ['app.bsky.actor.getProfile'], aud: '*' })],
  },
  // no keyset - this makes it a public client
  actorResolver: /* ... */,
  stores: /* ... */,
});
```

the library automatically builds the `client_id` from the redirect URIs and scope.
