---
'@atcute/oauth-browser-client': minor
---

allow customizing some parts of the authorization process

`createAuthorizationUrl` now takes in optional `prompt`, `display`, `locale` fields.

```ts
const authUrl = createAuthorizationUrl({
	// ...
	display: 'popup',
});
```
