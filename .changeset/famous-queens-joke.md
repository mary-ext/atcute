---
'@atcute/oauth-node-client': patch
---

add scope builder for constructing OAuth scopes

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
