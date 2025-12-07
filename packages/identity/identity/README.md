# @atcute/identity

types, schemas, and utilities for working with AT Protocol identities.

```sh
npm install @atcute/identity
```

in AT Protocol, users are identified by [DIDs](https://www.w3.org/TR/did-core/) (decentralized
identifiers). this package provides tools for working with DIDs and DID documents - the documents
that describe a user's identity, including their handle, PDS location, and cryptographic keys.

for resolving handles and DIDs (fetching their documents), see `@atcute/identity-resolver`.

## usage

### checking DID types

AT Protocol supports two DID methods: `did:plc` and `did:web`. use the type guards to check which
method a DID uses:

```ts
import { isPlcDid, isWebDid, isAtprotoDid } from '@atcute/identity';

const did = 'did:plc:z72i7hdynmk6r22z27h6tvur';

if (isPlcDid(did)) {
	// did:plc identifier
	console.log('PLC DID');
}

if (isWebDid(did)) {
	// did:web identifier (general, includes custom paths)
	console.log('Web DID');
}

if (isAtprotoDid(did)) {
	// either did:plc or atproto-compatible did:web
	console.log('AT Protocol DID');
}
```

`isAtprotoDid` checks for DIDs that are valid in AT Protocol - this excludes did:web identifiers
with custom paths, which atproto doesn't support.

### extracting the DID method

```ts
import { extractDidMethod } from '@atcute/identity';

const method = extractDidMethod('did:plc:z72i7hdynmk6r22z27h6tvur');
// -> "plc"
```

### working with did:web

convert a did:web identifier to its DID document URL:

```ts
import { webDidToDocumentUrl, normalizeWebDid } from '@atcute/identity';

// simple domain
const url = webDidToDocumentUrl('did:web:example.com');
// -> URL { href: "https://example.com/.well-known/did.json" }

// with path
const url2 = webDidToDocumentUrl('did:web:example.com:users:alice');
// -> URL { href: "https://example.com/users/alice/did.json" }

// normalize for comparison
const normalized = normalizeWebDid('did:web:EXAMPLE.COM');
// -> "did:web:example.com"
```

### reading DID documents

once you have a DID document (from a resolver or API), extract information using the utility
functions:

```ts
import {
	getPdsEndpoint,
	getAtprotoHandle,
	getAtprotoVerificationMaterial,
	getLabelerEndpoint,
} from '@atcute/identity';
import type { DidDocument } from '@atcute/identity';

const doc: DidDocument = {
	'@context': ['https://www.w3.org/ns/did/v1'],
	id: 'did:plc:z72i7hdynmk6r22z27h6tvur',
	alsoKnownAs: ['at://bsky.app'],
	verificationMethod: [
		{
			id: 'did:plc:z72i7hdynmk6r22z27h6tvur#atproto',
			type: 'Multikey',
			controller: 'did:plc:z72i7hdynmk6r22z27h6tvur',
			publicKeyMultibase: 'zDnaek...',
		},
	],
	service: [
		{
			id: '#atproto_pds',
			type: 'AtprotoPersonalDataServer',
			serviceEndpoint: 'https://morel.us-east.host.bsky.network',
		},
	],
};

// get the user's PDS URL
const pds = getPdsEndpoint(doc);
// -> "https://morel.us-east.host.bsky.network"

// get the user's handle
const handle = getAtprotoHandle(doc);
// -> "bsky.app"

// get the signing key material
const key = getAtprotoVerificationMaterial(doc);
// -> { type: "Multikey", publicKeyMultibase: "zDnaek..." }
```

### service endpoint helpers

extract specific service endpoints from DID documents:

```ts
import {
	getPdsEndpoint,
	getLabelerEndpoint,
	getBlueskyChatEndpoint,
	getBlueskyFeedgenEndpoint,
	getBlueskyNotificationEndpoint,
	getAtprotoServiceEndpoint,
} from '@atcute/identity';

// standard helpers for common services
const pds = getPdsEndpoint(doc); // #atproto_pds
const labeler = getLabelerEndpoint(doc); // #atproto_labeler
const chat = getBlueskyChatEndpoint(doc); // #bsky_chat
const feedgen = getBlueskyFeedgenEndpoint(doc); // #bsky_fg
const notif = getBlueskyNotificationEndpoint(doc); // #bsky_notif

// or use the generic helper for custom services
const custom = getAtprotoServiceEndpoint(doc, {
	id: '#my_service',
	type: 'MyServiceType', // optional type filter
});
```

### validating DID documents

use the validation schemas to check if a DID document is well-formed:

```ts
import { defs } from '@atcute/identity';

const result = defs.didDocument.try(unknownData);
if (result.ok) {
	// result.value is a validated DidDocument
	console.log(result.value.id);
} else {
	// validation failed
	console.error('invalid DID document');
}
```

the schema validates:

- required fields (`@context`, `id`)
- DID string format
- verification method structure and key formats
- service endpoint URLs
- no duplicate entries in arrays

### type definitions

the package exports TypeScript types for DID document structures:

```ts
import type { DidDocument, VerificationMethod, Service } from '@atcute/identity';

// DidDocument - the full DID document
// VerificationMethod - a verification method entry
// Service - a service endpoint entry
```
