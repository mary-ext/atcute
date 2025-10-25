---
'@atcute/oauth-browser-client': major
---

allow passing user-provided state during authorization

`createAuthorizationUrl` now takes in an optional `state` property

```ts
const authUrl = await createAuthorizationUrl({
	// ...
	state: {
		// ...
	},
});
```

`finalizeAuthorization` now returns an object containing `session` and your provided `state`.

```ts
const { session, state } = await finalizeAuthorization(params);
```
