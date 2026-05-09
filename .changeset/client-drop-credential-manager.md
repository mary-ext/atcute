---
'@atcute/client': major
---

drop `CredentialManager`

use `PasswordSession` from `@atcute/password-session` instead.

```ts
// before
import { CredentialManager } from '@atcute/client';

const manager = new CredentialManager({ service: 'https://bsky.social' });
await manager.login({ identifier, password });

// after
import { PasswordSession } from '@atcute/password-session';

const session = await PasswordSession.login({
	service: 'https://bsky.social',
	identifier,
	password,
});
```
