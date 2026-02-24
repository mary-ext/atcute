# @atcute/password-session

password-based session management for AT Protocol services. manages access/refresh token lifecycle,
automatic refresh on 401, and session persistence via callbacks.

for browser-based applications, prefer OAuth-based authentication. when using password auth, use app
passwords rather than main account credentials.

```sh
npm install @atcute/password-session @atcute/client @atcute/bluesky
```

## usage

### login

```ts
import { Client, ok } from '@atcute/client';
import { PasswordSession } from '@atcute/password-session';

import type {} from '@atcute/bluesky';

const session = await PasswordSession.login(
	{ service: 'https://bsky.social', identifier: 'you.bsky.social', password: 'your-app-password' },
	{
		onUpdate(data) {
			// called on login and token refresh — persist the session
			localStorage.setItem('session', JSON.stringify(data));
		},
		onDelete(data) {
			// called on logout or session invalidation — clean up
			localStorage.removeItem('session');
		},
	},
);

const rpc = new Client({ handler: session });

const data = await ok(rpc.get('com.atproto.server.getSession'));
console.log(data.did);
```

### URL shorthand

for bots and scripts, use URL shorthand with `await using` for automatic logout:

```ts
await using session = await PasswordSession.login('https://handle:app-pass@bsky.social');
const rpc = new Client({ handler: session });
```

### resuming sessions

resume a persisted session without re-entering credentials:

```ts
const saved = localStorage.getItem('session');
if (saved) {
	const session = await PasswordSession.resume(JSON.parse(saved), {
		onUpdate(data) {
			localStorage.setItem('session', JSON.stringify(data));
		},
		onDelete(data) {
			localStorage.removeItem('session');
		},
	});
	const rpc = new Client({ handler: session });
}
```

### cached session with credential fallback

for bots with both stored credentials and cached sessions, `login()` can try the cached session
first and fall back to fresh authentication:

```ts
const session = await PasswordSession.login('https://handle:app-pass@bsky.social', {
	session: loadFromDisk(),
	onUpdate(data) {
		saveToDisk(data);
	},
});
```

### lazy construction

if you don't need upfront validation, construct directly — tokens refresh lazily on 401:

```ts
const session = new PasswordSession(savedData, { onUpdate, onDelete });
const rpc = new Client({ handler: session });
```

### cleanup

delete an orphaned session server-side without resuming:

```ts
await PasswordSession.delete(savedData);
```

## callbacks

| callback          | when                                       | session state     |
| ----------------- | ------------------------------------------ | ----------------- |
| `onUpdate`        | login succeeds, tokens refresh successfully | active (updated)  |
| `onUpdateFailure` | token refresh fails transiently (network)  | active (preserved)|
| `onDelete`        | logout succeeds, session invalidated       | destroyed         |
| `onDeleteFailure` | logout fails transiently (network)         | active (preserved)|

all callbacks receive `this: PasswordSession` context and must not throw.
