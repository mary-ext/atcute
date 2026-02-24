# @atcute/client

lightweight and cute API client for AT Protocol.

```sh
npm install @atcute/client @atcute/bluesky
```

## prerequisites

the client requires a definition package to know what queries and procedures are available. install
one alongside the client:

```sh
npm install @atcute/client @atcute/bluesky
```

then register the type definitions using one of these methods:

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/bluesky"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/bluesky" />
```

```ts
// or as an import in your entrypoint
import type {} from '@atcute/bluesky';
```

now the XRPC methods will have full type information for the registered schemas.

available packages:

| package                                                            | schemas                                 |
| ------------------------------------------------------------------ | --------------------------------------- |
| [`@atcute/atproto`](../../definitions/atproto)                     | `com.atproto.*`                         |
| [`@atcute/bluesky`](../../definitions/bluesky)                     | `app.bsky.*`, `chat.bsky.*`             |
| [`@atcute/ozone`](../../definitions/ozone)                         | `tools.ozone.*`                         |
| [`@atcute/bluemoji`](../../definitions/bluemoji)                   | `blue.moji.*`                           |
| [`@atcute/frontpage`](../../definitions/frontpage)                 | `fyi.unravel.frontpage.*`               |
| [`@atcute/leaflet`](../../definitions/leaflet)                     | `pub.leaflet.*`                         |
| [`@atcute/whitewind`](../../definitions/whitewind)                 | `com.whtwnd.*`                          |
| [`@atcute/tangled`](../../definitions/tangled)                     | `sh.tangled.*`                          |
| [`@atcute/microcosm`](../../definitions/microcosm)                 | `blue.microcosm.*`, `com.bad-example.*` |
| [`@atcute/pckt`](../../definitions/pckt)                           | `blog.pckt.*`                           |
| [`@atcute/standard-site`](../../definitions/standard-site)         | `site.standard.*`                       |
| [`@atcute/lexicon-community`](../../definitions/lexicon-community) | `community.lexicon.*`                   |

you can register multiple packages to combine their types.

## usage

the client communicates with AT Protocol services using XRPC, a simple RPC framework over HTTP.
queries are GET requests, procedures are POST requests.

### making requests

```ts
import { Client, simpleFetchHandler } from '@atcute/client';
import type {} from '@atcute/bluesky';

// create a client pointing to the Bluesky public API
const rpc = new Client({ handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }) });
```

use `get()` for queries and `post()` for procedures. both return a response object with `ok`,
`status`, `headers`, and `data` fields:

```ts
// queries use get()
const response = await rpc.get('app.bsky.actor.getProfile', {
	params: { actor: 'bsky.app' },
});

if (response.ok) {
	console.log(response.data.displayName);
	// -> "Bluesky"
}
```

```ts
// procedures use post()
const response = await rpc.post('com.atproto.repo.createRecord', {
	input: {
		repo: 'did:plc:1234...',
		collection: 'app.bsky.feed.post',
		record: {
			$type: 'app.bsky.feed.post',
			text: 'hello world!',
			createdAt: new Date().toISOString(),
		},
	},
});
```

### handling errors

responses always include an `ok` field indicating success. for failed requests, `data` contains an
error object with `error` (the error name) and optionally `message` (description):

```ts
const response = await rpc.get('app.bsky.actor.getProfile', {
	params: { actor: 'nonexistent.invalid' },
});

if (!response.ok) {
	console.log(response.data.error);
	// -> "InvalidRequest"
	console.log(response.data.message);
	// -> "Unable to resolve handle"
}
```

the error names are defined in the lexicon schema. you can switch on them for typed error handling:

```ts
if (!response.ok) {
	switch (response.data.error) {
		case 'InvalidRequest':
			// handle or account doesn't exist
			break;
		case 'AccountTakedown':
			// account was taken down
			break;
		case 'AccountDeactivated':
			// account deactivated by user
			break;
	}
}
```

### optimistic requests

if you prefer throwing on errors instead of checking `response.ok`, use the `ok()` helper:

```ts
import { Client, ok, simpleFetchHandler } from '@atcute/client';

const rpc = new Client({
	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
});

// throws ClientResponseError if the request fails
const profile = await ok(rpc.get('app.bsky.actor.getProfile', { params: { actor: 'bsky.app' } }));

console.log(profile.displayName);
// -> "Bluesky"
```

catch errors with `ClientResponseError`:

```ts
import { ClientResponseError } from '@atcute/client';

try {
	const profile = await ok(rpc.get('app.bsky.actor.getProfile', { params: { actor: 'invalid' } }));
} catch (err) {
	if (err instanceof ClientResponseError) {
		console.log(err.error); // error name from server
		console.log(err.description); // error message from server
		console.log(err.status); // HTTP status code
	}
}
```

### authenticated requests

for password-based authentication, use `PasswordSession` from `@atcute/password-session`. it manages
tokens, automatically refreshes expired access tokens, and can persist sessions:

```sh
npm install @atcute/password-session
```

```ts
import { Client, ok } from '@atcute/client';
import { PasswordSession } from '@atcute/password-session';

const auth = await PasswordSession.login({
	service: 'https://bsky.social',
	identifier: 'you.bsky.social',
	password: 'your-app-password',
});

const rpc = new Client({ handler: auth });

// requests are now authenticated
const session = await ok(rpc.get('com.atproto.server.getSession'));
console.log(session.did);
// -> "did:plc:..."
```

save `auth.session` to persist login across app restarts:

```ts
// after login, save the session
localStorage.setItem('session', JSON.stringify(auth.session));
```

```ts
// later, restore the session
const saved = localStorage.getItem('session');
if (saved) {
	const auth = await PasswordSession.resume(JSON.parse(saved));
	const rpc = new Client({ handler: auth });
}
```

use callbacks to keep persisted sessions in sync:

```ts
const auth = await PasswordSession.login(
	{
		service: 'https://bsky.social',
		identifier: 'you.bsky.social',
		password: 'your-app-password',
	},
	{
		onUpdate(session) {
			// called on login and token refresh
			localStorage.setItem('session', JSON.stringify(session));
		},
		onDelete(session) {
			// called on logout or session invalidation
			localStorage.removeItem('session');
		},
	},
);
```

### response formats

by default, responses are parsed as JSON. for endpoints that return binary data, specify the format
with `as`:

```ts
// get response as a Blob
const { data: blob } = await ok(
	rpc.get('com.atproto.sync.getBlob', {
		params: { did: 'did:plc:...', cid: 'bafyrei...' },
		as: 'blob',
	}),
);

// get response as Uint8Array
const { data: bytes } = await ok(
	rpc.get('com.atproto.sync.getBlob', {
		params: { did: 'did:plc:...', cid: 'bafyrei...' },
		as: 'bytes',
	}),
);

// get response as ReadableStream
const { data: stream } = await ok(
	rpc.get('com.atproto.sync.getBlob', {
		params: { did: 'did:plc:...', cid: 'bafyrei...' },
		as: 'stream',
	}),
);

// discard response body
await ok(
	rpc.post('com.atproto.repo.deleteRecord', {
		input: { repo: 'did:plc:...', collection: '...', rkey: '...' },
		as: null,
	}),
);
```

### runtime validation

by default, responses are trusted without validation. for stricter guarantees, use `call()` with the
schema from a definition package:

```ts
import { Client, ok, simpleFetchHandler } from '@atcute/client';
import { AppBskyActorGetProfile } from '@atcute/bluesky';

const rpc = new Client({
	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
});

// validates params, input, and output against the schema
const response = await rpc.call(AppBskyActorGetProfile, {
	params: { actor: 'bsky.app' },
});

if (response.ok) {
	// response.data is validated
	console.log(response.data.displayName);
}
```

validation errors throw `ClientValidationError`:

```ts
import { ClientValidationError } from '@atcute/client';

try {
	await rpc.call(AppBskyActorGetProfile, { params: { actor: 'invalid!' } });
} catch (err) {
	if (err instanceof ClientValidationError) {
		console.log(err.target); // 'params', 'input', or 'output'
		console.log(err.message); // validation error details
	}
}
```

### service proxying

service proxying lets you make authenticated requests through your PDS to other services. the PDS
forwards the request with authorization headers proving it's acting on your behalf.

```ts
import { Client, ok } from '@atcute/client';
import { PasswordSession } from '@atcute/password-session';

// must be authenticated
const session = await PasswordSession.login({
	service: 'https://bsky.social',
	identifier: 'you.bsky.social',
	password: 'your-app-password',
});

// create a client that proxies requests through your PDS to the chat service
const chatClient = new Client({
	handler: session,
	proxy: {
		did: 'did:web:api.bsky.chat',
		serviceId: '#bsky_chat',
	},
});

// request goes to your PDS, which forwards it to api.bsky.chat with auth headers
const convos = await ok(chatClient.get('chat.bsky.convo.listConvos'));
```

common service IDs include:

- `#atproto_pds` - personal data server
- `#atproto_labeler` - labeler service
- `#bsky_chat` - Bluesky chat service

### custom fetch handlers

the `simpleFetchHandler` works for most cases. for advanced scenarios, provide your own handler:

```ts
import type { FetchHandler } from '@atcute/client';

const customHandler: FetchHandler = async (pathname, init) => {
	// pathname is like "/xrpc/app.bsky.actor.getProfile?actor=bsky.app"
	const url = new URL(pathname, 'https://public.api.bsky.app');

	// add custom headers, logging, retry logic, etc.
	console.log(`${init.method?.toUpperCase()} ${url}`);

	return fetch(url, init);
};

const rpc = new Client({ handler: customHandler });
```

or implement `FetchHandlerObject` for stateful handlers (like `PasswordSession` does):

```ts
import type { FetchHandlerObject } from '@atcute/client';

class MyHandler implements FetchHandlerObject {
	async handle(pathname: string, init: RequestInit): Promise<Response> {
		// your implementation
		return fetch(new URL(pathname, 'https://...'), init);
	}
}

const rpc = new Client({ handler: new MyHandler() });
```
