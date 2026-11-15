---
'@atcute/oauth-node-client': minor
---

allow multiple sessions per DID via custom `createSessionId` keys

```ts
const oauth = new OAuthClient({
	// ...
	createSessionId: ({ sub, state }) => `${sub}:${crypto.randomUUID()}`,
});

const { session } = await oauth.callback(params);
const sessionId = session.sessionId;

await oauth.restore(sessionId);
await oauth.revoke(sessionId);
```
