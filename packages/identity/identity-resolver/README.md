# @atcute/identity-resolver

handle and DID document resolution for AT Protocol.

```sh
npm install @atcute/identity-resolver
```

in AT Protocol, handles (like `alice.bsky.social`) need to be resolved to DIDs, and DIDs need to be
resolved to DID documents (which contain the user's PDS location and keys). this package provides
resolvers for both.

## usage

### resolving handles

handles can be resolved via DNS TXT records or HTTP well-known endpoints. use the composite resolver
to try both:

```ts
import {
	CompositeHandleResolver,
	DohJsonHandleResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';

const handleResolver = new CompositeHandleResolver({
	methods: {
		dns: new DohJsonHandleResolver({ dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query' }),
		http: new WellKnownHandleResolver(),
	},
});

const did = await handleResolver.resolve('bsky.app');
// -> "did:plc:z72i7hdynmk6r22z27h6tvur"
```

### resolution strategies

the composite resolver supports different strategies for combining DNS and HTTP resolution:

```ts
const handleResolver = new CompositeHandleResolver({
	strategy: 'race', // default - first successful response wins
	methods: { dns: dnsResolver, http: httpResolver },
});
```

available strategies:

- `race` - returns whichever method succeeds first (default)
- `dns-first` - try DNS first, fall back to HTTP if it fails
- `http-first` - try HTTP first, fall back to DNS if it fails
- `both` - require both methods to agree (throws `AmbiguousHandleError` if they differ)

### resolving DID documents

DID documents can be resolved for did:plc and did:web methods:

```ts
import {
	CompositeDidDocumentResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
} from '@atcute/identity-resolver';

const didResolver = new CompositeDidDocumentResolver({
	methods: {
		plc: new PlcDidDocumentResolver(),
		web: new WebDidDocumentResolver(),
	},
});

const doc = await didResolver.resolve('did:plc:z72i7hdynmk6r22z27h6tvur');
// -> { '@context': [...], id: 'did:plc:...', service: [...], ... }
```

### resolving actors

the `ActorResolver` interface provides a way to resolve an actor identifier (handle or DID) to the
essential info needed to interact with them: their DID, verified handle, and PDS endpoint.

`LocalActorResolver` implements this by combining handle and DID document resolution locally:

```ts
import { LocalActorResolver } from '@atcute/identity-resolver';

const actorResolver = new LocalActorResolver({
	handleResolver,
	didDocumentResolver: didResolver,
});

// resolve from handle
const actor = await actorResolver.resolve('bsky.app');
// -> { did: "did:plc:...", handle: "bsky.app", pds: "https://..." }

// resolve from DID
const actor2 = await actorResolver.resolve('did:plc:z72i7hdynmk6r22z27h6tvur');
// -> { did: "did:plc:...", handle: "bsky.app", pds: "https://..." }
```

the local resolver performs bidirectional verification: it checks that the handle in the DID
document resolves back to the same DID.

other implementations of `ActorResolver` can get this info from dedicated identity services (like
Slingshot) without needing to fetch and parse full DID documents.

### handling errors

each resolver throws specific error types for different failure cases:

```ts
import {
	DidNotFoundError,
	InvalidResolvedHandleError,
	AmbiguousHandleError,
	FailedHandleResolutionError,
	HandleResolutionError,
} from '@atcute/identity-resolver';

try {
	const did = await handleResolver.resolve('nonexistent.invalid');
} catch (err) {
	if (err instanceof DidNotFoundError) {
		// handle has no DID record
		console.log('handle not found');
	} else if (err instanceof InvalidResolvedHandleError) {
		// handle returned an invalid DID format
		console.log('invalid DID:', err.did);
	} else if (err instanceof AmbiguousHandleError) {
		// multiple different DIDs found (with 'both' strategy)
		console.log('ambiguous handle');
	} else if (err instanceof FailedHandleResolutionError) {
		// network or other unexpected error
		console.log('resolution failed:', err.cause);
	} else if (err instanceof HandleResolutionError) {
		// catch-all for any handle resolution error
	}
}
```

DID document resolution errors:

```ts
import {
	DocumentNotFoundError,
	UnsupportedDidMethodError,
	ImproperDidError,
	FailedDocumentResolutionError,
	DidDocumentResolutionError,
} from '@atcute/identity-resolver';

try {
	const doc = await didResolver.resolve('did:example:123');
} catch (err) {
	if (err instanceof DocumentNotFoundError) {
		// DID document doesn't exist
	} else if (err instanceof UnsupportedDidMethodError) {
		// resolver doesn't support this DID method
	} else if (err instanceof ImproperDidError) {
		// DID format is invalid for this method
	} else if (err instanceof FailedDocumentResolutionError) {
		// network or other unexpected error
	} else if (err instanceof DidDocumentResolutionError) {
		// catch-all for any DID resolution error
	}
}
```

### caching and abort signals

all resolvers accept options for cache control and cancellation:

```ts
// skip cache
const did = await handleResolver.resolve('bsky.app', { noCache: true });

// with abort signal
const controller = new AbortController();
const did = await handleResolver.resolve('bsky.app', { signal: controller.signal });

// cancel the request
controller.abort();
```

### custom fetch function

all resolvers accept a custom fetch implementation:

```ts
const dnsResolver = new DohJsonHandleResolver({
	dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query',
	fetch: customFetch,
});

const httpResolver = new WellKnownHandleResolver({
	fetch: customFetch,
});

const plcResolver = new PlcDidDocumentResolver({
	fetch: customFetch,
});
```

### custom PLC directory

by default, did:plc resolution uses `https://plc.directory`. you can specify a different directory:

```ts
const plcResolver = new PlcDidDocumentResolver({
	apiUrl: 'https://plc.wtf', // mirror of plc.directory
});
```

## resolver classes

### handle resolvers

| class                     | description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `DohJsonHandleResolver`   | resolves via DNS-over-HTTPS (TXT record at `_atproto.{handle}`) |
| `WellKnownHandleResolver` | resolves via HTTP (`https://{handle}/.well-known/atproto-did`)  |
| `XrpcHandleResolver`      | resolves via XRPC (`com.atproto.identity.resolveHandle`)        |
| `CompositeHandleResolver` | combines DNS and HTTP resolvers                                 |

### DID document resolvers

| class                          | description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `PlcDidDocumentResolver`       | resolves did:plc from PLC directory                   |
| `WebDidDocumentResolver`       | resolves did:web from domain                          |
| `XrpcDidDocumentResolver`      | resolves via XRPC (`com.atproto.identity.resolveDid`) |
| `CompositeDidDocumentResolver` | routes to resolver by DID method                      |

### actor resolvers

| class                | description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `LocalActorResolver` | combines handle and DID resolution with bidirectional verification |
