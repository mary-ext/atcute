# @atcute/lexicons

core types and syntax validators for AT Protocol.

```sh
npm install @atcute/lexicons
```

this package provides syntax validators for AT Protocol's string formats (handles, DIDs, NSIDs,
etc.) and validation functions for use with lexicon schemas from definition packages.

## usage

### validating syntax

use the syntax validators to check AT Protocol string formats:

```ts
import {
	isHandle,
	isDid,
	isNsid,
	isCid,
	isTid,
	isRecordKey,
	isDatetime,
	isResourceUri,
	isActorIdentifier,
} from '@atcute/lexicons/syntax';

// handle format (domain names)
isHandle('alice.bsky.social'); // true
isHandle('invalid'); // false (no TLD)

// DID format
isDid('did:plc:z72i7hdynmk6r22z27h6tvur'); // true
isDid('did:web:example.com'); // true
isDid('not-a-did'); // false

// NSID format (namespaced identifiers)
isNsid('app.bsky.feed.post'); // true
isNsid('com.atproto.repo.createRecord'); // true

// CID format (content identifiers)
isCid('bafyreigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'); // true

// TID format (timestamp identifiers)
isTid('3jzfcijpj2z2a'); // true

// record key format
isRecordKey('3jzfcijpj2z2a'); // true (TID)
isRecordKey('self'); // true (literal "self")

// datetime format (ISO 8601)
isDatetime('2024-01-15T12:00:00.000Z'); // true

// AT URI format
isResourceUri('at://did:plc:123/app.bsky.feed.post/abc'); // true

// actor identifier (handle or DID)
isActorIdentifier('alice.bsky.social'); // true
isActorIdentifier('did:plc:123'); // true
```

### parsing AT URIs

parse AT URIs to extract their components:

```ts
import { parseResourceUri, parseCanonicalResourceUri } from '@atcute/lexicons/syntax';

// parse any AT URI (handle or DID authority)
const uri = parseResourceUri('at://alice.bsky.social/app.bsky.feed.post/123');
if (uri.ok) {
	console.log(uri.value.repo); // 'alice.bsky.social'
	console.log(uri.value.collection); // 'app.bsky.feed.post'
	console.log(uri.value.rkey); // '123'
}

// parse canonical AT URI (DID authority only)
const canonical = parseCanonicalResourceUri('at://did:plc:123/app.bsky.feed.post/abc');
if (canonical.ok) {
	console.log(canonical.value.repo); // 'did:plc:123'
}
```

### branded types

the syntax module exports branded types for type-safe string handling:

```ts
import type { Handle, Did, Nsid, Cid, Tid, RecordKey, Datetime } from '@atcute/lexicons/syntax';
import { isHandle } from '@atcute/lexicons/syntax';

function getProfile(handle: Handle): Promise<Profile> {
	// handle is guaranteed to be a valid handle format
}

const input = 'alice.bsky.social';
if (isHandle(input)) {
	// input is narrowed to Handle type
	getProfile(input);
}
```

### validating records

validate data against lexicon schemas using `is()`, `safeParse()`, or `parse()`. schemas come from
definition packages like `@atcute/bluesky`:

```ts
import { is, safeParse, parse, ValidationError } from '@atcute/lexicons';
import { AppBskyFeedPost } from '@atcute/bluesky';

const data: unknown = {
	$type: 'app.bsky.feed.post',
	text: 'hello world',
	createdAt: '2024-01-15T12:00:00.000Z',
};

// type guard - returns boolean
if (is(AppBskyFeedPost.mainSchema, data)) {
	// data is typed as AppBskyFeedPost.$record
	console.log(data.text);
}

// safe parse - returns result object
const result = safeParse(AppBskyFeedPost.mainSchema, data);
if (result.ok) {
	console.log(result.value.text);
} else {
	console.log(result.message);
	console.log(result.issues);
}

// parse - throws on failure
try {
	const post = parse(AppBskyFeedPost.mainSchema, data);
	console.log(post.text);
} catch (err) {
	if (err instanceof ValidationError) {
		console.log(err.message);
		console.log(err.issues);
	}
}
```

### IPLD types

the package exports types for IPLD data structures used in AT Protocol:

```ts
import type { Blob, Bytes, CidLink } from '@atcute/lexicons';

// Blob - reference to uploaded media (images, videos)
// Bytes - raw binary data (base64 encoded in JSON)
// CidLink - reference to content by CID
```
