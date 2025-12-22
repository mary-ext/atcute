# @atcute/oauth-node-client

## 0.1.3

### Patch Changes

- 5c9f96c: add scope builder for constructing OAuth scopes

  the `scope` namespace provides type-safe helpers for building atproto OAuth scope strings.

  ```ts
  import { OAuthClient, scope } from '@atcute/oauth-node-client';

  const oauth = new OAuthClient({
  	metadata: {
  		// ...
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
  	},

  	// ...
  });
  ```

- Updated dependencies [10ec011]
  - @atcute/identity-resolver@1.2.1

## 0.1.2

### Patch Changes

- d206199: remove unnecessary in-memory lock

  SessionGetter has no need to pull in a default lock function for single-process usage,
  CachedGetter already provides guarantee that only one session restoration can happen at a time for
  a given DID.

## 0.1.1

### Patch Changes

- 937b6a3: do not check if jwks_uri is same-origin
