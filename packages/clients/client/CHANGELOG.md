# @atcute/client

## 5.1.0

### Minor Changes

- 99de512: add `retryFetchHandler`, a middleware that retries rate-limited (429) responses with
  backoff, and `parseRateLimitHeaders` for reading the server's `RateLimit-*` headers

## 5.0.0

### Major Changes

- 63a1d80: drop `CredentialManager`

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

- 0fb5499: replace `Client`'s `proxy` option object with an `AtprotoAudience` string

  the `ServiceProxyOptions` type is gone.

  ```ts
  // before
  new Client({
  	handler,
  	proxy: { did: 'did:web:api.bsky.chat', serviceId: '#bsky_chat' },
  });

  // after
  new Client({ handler, proxy: 'did:web:api.bsky.chat#bsky_chat' });
  ```

### Patch Changes

- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [d64ddf1]
  - @atcute/identity@2.0.0
  - @atcute/lexicons@2.0.0

## 4.2.2

### Patch Changes

- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/identity@1.1.5
  - @atcute/lexicons@1.3.1

## 4.2.1

### Patch Changes

- c20907b: set `duplex: 'half'` when a ReadableStream is passed

## 4.2.0

### Minor Changes

- 5aa68c3: add `logout()` method to CredentialManager to properly invalidate sessions server-side

### Patch Changes

- 5aa68c3: add concurrent session protection in CredentialManager:
  - protect against concurrent `resume()` of the same session
  - detect concurrent session updates in `#refreshSessionInner()`
  - clear `#refreshSessionPromise` before login to prevent stale refreshes

- 5aa68c3: treat 401 responses as expired tokens (checked synchronously before async ExpiredToken
  check)
- 5aa68c3: improve retry logic in CredentialManager fetch handler:
  - check if request was aborted before retrying
  - compare tokens to detect if refresh actually happened
  - cancel response body before retrying to prevent resource leaks

- 5aa68c3: add DID validation in CredentialManager:
  - detect DID mismatch during token refresh
  - validate JWT `sub` claims match session DID on resume

## 4.1.2

### Patch Changes

- 54d7769: require `as` to be passed in call() for endpoints expected to return blobs

## 4.1.1

### Patch Changes

- 387b291: do not pass URL instances to fetch()

## 4.1.0

### Minor Changes

- 64a4511: opt-in runtime validation for XRPC calls

  by default, `@atcute/client` assumes the server is trusted and skips runtime validation. you can
  now opt into validation using the new `call()` method with lexicon schemas.

  ```ts
  import { Client, simpleFetchHandler } from '@atcute/client';
  import * as AppBskyActorGetProfile from '@atcute/bluesky/types/actor/getProfile';

  const client = new Client({
  	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
  });

  // validates params, input, and output against lexicon schema
  const { ok, data } = await client.call(AppBskyActorGetProfile, {
  	params: { actor: 'bsky.app' },
  });
  ```

  validation failures throw `ClientValidationError` with detailed error information.

  validation code is automatically tree-shaken when not used.

### Patch Changes

- Updated dependencies [03a13b3]
  - @atcute/lexicons@1.2.5

## 4.0.5

### Patch Changes

- 7f0e453: allow `as: null` to discard response body entirely

## 4.0.4

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/identity@1.1.1

## 4.0.3

### Patch Changes

- bd446e4: `ok()` shouldn't error on requests with `as: null`

## 4.0.2

### Patch Changes

- Updated dependencies [61b0fd1]
  - @atcute/lexicons@1.0.2
  - @atcute/identity@1.0.2

## 4.0.1

### Patch Changes

- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1
  - @atcute/identity@1.0.1

## 4.0.0

### Major Changes

- d02554d: a major change to how types are consumed, and schema validation!

  this change is pretty big, where it used to be that `@atcute/client` would ship type definitions
  for core lexicon types (`At.Did`, `At.ResourceUri`, `At.CidLink` and so on) and `com.atproto.*`
  interfaces, they're now decoupled into their own packages:
  - `@atcute/lexicons` for core lexicon types
  - `@atcute/atproto` for `com.atproto.*` interfaces

  when upgrading `@atcute/client`, you must now install `@atcute/lexicons`. if you use any types
  from `com.atproto.*`, then you'd need to install `@atcute/atproto` as well.

  migration notes:
  - the `At` namespace is gone, you can import `Did`, `ResourceUri` and many other core types
    directly from `@atcute/lexicons`

    ```ts
    import type { Did } from '@atcute/lexicons';
    import type { AppBskyActorDefs } from '@atcute/bluesky';

    export const findAllProfiles = (did: Did): AppBskyActorDefs.ProfileView[] => {
    	// ...
    };
    ```

  - interfaces now use the `$type` field instead of a type-only symbol for branding. consequently
    the `Brand` namespace which contains utilities for dealing with branding is renamed to `$type`,
    use `$type.enforce<>` to enforce the existence of a `$type` field.

    ```ts
    import type { $type } from '@atcute/lexicons';
    import type { AppBskyRichtextFacet } from '@atcute/bluesky';

    type Facet = AppBskyRichtextFacet.Main;
    type MentionFeature = $type.enforce<AppBskyRichtextFacet.Mention>;

    const mention: MentionFeature = {
    	$type: 'app.bsky.richtext.facet#mention',
    	did: 'did:plc:z72i7hdynmk6r22z27h6tvur',
    };

    const facet: Facet = {
    	index: {
    		byteStart: 6,
    		byteEnd: 15,
    	},
    	features: [mention],
    };
    ```

  - record interfaces are renamed, they're no longer `Record` but rather `Main`

    ```ts
    import type { AppBskyFeedPost } from '@atcute/bluesky';

    const record: AppBskyFeedPost.Main = {
    	$type: 'app.bsky.feed.post',
    	text: `hello world!`,
    	createdAt: new Date().toISOString(),
    };
    ```

  - queries and procedures no longer have exported interfaces for their parameters, input body and
    output body. use `InferInput`/`InferOutput` and `InferXRPCBodyInput`/`InferXRPCBodyOutput` to
    get them.

    ```ts
    import type {
    	InferInput,
    	InferOutput,
    	InferXRPCBodyInput,
    	InferXRPCBodyOutput,
    } from '@atcute/lexicons';

    import type { AppBskyActorSearchActors } from '@atcute/bluesky';

    // parameters where all the default fields are marked optional
    type ParamsInput = InferInput<AppBskyActorSearchActors.mainSchema['params']>;
    // parameters where all the default fields are marked required (filled out)
    type ParamsOutput = InferOutput<AppBskyActorSearchActors.mainSchema['params']>;

    type ResponseInput = InferXRPCBodyInput<AppBskyActorSearchActors.mainSchema['output']>;
    type ResponseOutput = InferXRPCBodyOutput<AppBskyActorSearchActors.mainSchema['output']>;
    ```

  this change means that downstream consumers that were only relying on `@atcute/client` for its
  type definitions no longer are pinned on the versioning of the API client.

  that said, this isn't solely about restructuring type interfaces. we now provide runtime schemas
  and subsequently schema validation!

  ```ts
  import { ComAtprotoLabelDefs } from '@atcute/atproto';
  import { is } from '@atcute/lexicons';

  const label: ComAtprotoLabelDefs.Label = {
  	cts: '2024-11-13T04:46:40.254Z',
  	neg: false,
  	src: 'did:plc:wkoofae5uytcm7bjncmev6n6',
  	uri: 'did:plc:ia76kvnndjutgedggx2ibrem',
  	val: 'she-it',
  	ver: 1,
  };

  is(ComAtprotoLabelDefs.labelSchema, label);
  // -> true
  ```

  this is a big deal, where the reference TypeScript packages stuffed all the lexicons into a single
  validator instance, and relied on you to pick whether it should generate interfaces suited for
  either client or server. we generate code that allows for static type inference, allowing for
  client and servers to consume types from the same package.

  these schemas are web-friendly, they are treeshakeable by design, minimizing the impact it has on
  your bundle size.

  that's all! this whole plan has been almost 8 months in the making, I hope all of this change
  benefits the AT Protocol developer community in some way, just as AT Protocol gave me a lot of fun
  working with it.

- d02554d: the old `XRPC` interface for making API requests has been removed

  you'd need to migrate to the new `Client` interface

  ```ts
  const client = new Client({
  	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
  });

  const data = await ok(
  	client.get('app.bsky.actor.getProfile', {
  		params: {
  			actor: 'bsky.app',
  		},
  	}),
  );

  console.log(data.displayName);
  // -> Bluesky
  ```

### Patch Changes

- Updated dependencies [551c67a]
  - @atcute/identity@1.0.0

## 3.1.0

### Minor Changes

- 49028fb: a new Client class for making API requests, replacing the previous `XRPC` class.

  key changes include:
  - **explicit error handling**: the new `Client` class returns an object of `{ ok, data }` instead
    of throwing on non-successful responses. this should make it easier to handle these exceptional
    cases without needing to wrap the request in a try-catch block.

    ```ts
    const { ok, data } = await client.get('app.bsky.actor.getProfile', {
    	params: { actor: 'bsky.app' },
    });

    if (!ok) {
    	switch (data.error) {
    		case 'InvalidRequest': {
    			// account doesn't exist
    			break;
    		}
    		default: {
    			// default error handling
    		}
    	}
    }

    if (ok) {
    	console.log(data.displayName);
    	// -> "Bluesky"
    }
    ```

  - **optimistic response handling**: a `ok()` helper function is provided if you would like to use
    the old "optimistic" behavior.

    ```ts
    try {
    	const data = await ok(
    		client.get('app.bsky.actor.getProfile', {
    			params: { actor: 'bsky.app' },
    		}),
    	);

    	console.log(data.displayName);
    	// -> "Bluesky"
    } catch (err) {
    	if (err instanceof ClientResponseError) {
    		switch (err.error) {
    			case 'InvalidRequest': {
    				// account doesn't exist
    				break;
    			}
    			default: {
    				// default error handling
    			}
    		}
    	}
    }
    ```

  - **configurable response format**: the `as` field can be used to configure how the response body
    should be returned:
    - `"json"` parsed as JSON
    - `"blob"` returns a Blob
    - `"bytes"` returns a Uint8Array
    - `"stream"` returns a readable stream
    - `null` discards the response body

    providing this field is required if you're making a request to queries or procedures that do not
    return a JSON response. (e.g. `com.atproto.sync.getBlob`)

  - **clearer naming**:
    - `.call()` method is renamed to `.post()` to better reflect that it makes an HTTP POST request.
    - configuring service proxying should be less confusing.

      ```ts
      const client = new Client({
      	// ...
      	proxy: {
      		did: 'did:web:api.bsky.chat',
      		serviceId: '#bsky_chat',
      	},
      });
      ```

## 3.0.1

### Patch Changes

- 4f59252: pull latest Bluesky lexicons

## 3.0.0

this version contains breaking changes to the lexicon type definitions.

### Major Changes

- 813679f: add `At.Nsid` string type

  this is a specialized type for `nsid` formatted strings, where there were previously none.

- d3fbc7e: consistent casing on types and interfaces

  no more capitalized/pascalcase mixing, these following types are renamed:
  - `At.CID` → `At.Cid`
  - `At.CIDLink` → `At.CidLink`
  - `At.DID` → `At.Did`

- c7e8573: add `At.ResourceUri` string type

  this is a specialized type for `at-uri` formatted strings, replacing the previous `At.Uri` string

- 61bd8d2: add `At.GenericUri` string type

  this is a specialized type for `uri` formatted strings, where there were previously none.

### Minor Changes

- 9d05dfd: add `At.RecordKey` string type

  this is currently an alias to `string` for now.

- 13f35e4: allow passing ReadableStream and ArrayBuffer as input
- a47373f: add `At.Identifier` string type

  an alias for either `At.DID` or `At.Handle`

- 2d10bd8: add `At.CanonicalResourceUri` string type
- 8aedcc5: `At.Did` now contains a `TMethod` type parameter for specifying DID methods in the
  identifier.
- 45cfe46: add new response field, deprecating the old output field
- 24be9be: `At.Handle` string type is now stricter
- 87a99f1: add `At.Tid` string type

  this is currently an alias to string for now, but it can be made stricter later.

### Patch Changes

- 45cc699: clean up base types JSDoc

## 2.0.9

### Patch Changes

- 298189f: pull latest Bluesky lexicons
