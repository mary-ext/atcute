# @atcute/bluesky

## 3.0.3

### Patch Changes

- d798d91: pull latest Bluesky lexicons

## 3.0.2

### Patch Changes

- e2d3d00: ensure object properties, enums, and other sortable items are sorted
- 1b1bd64: CID-formatted strings should be validated

  somehow missed this

- Updated dependencies [e2d3d00]
- Updated dependencies [1b1bd64]
- Updated dependencies [61b0fd1]
  - @atcute/atproto@3.0.2
  - @atcute/lexicons@1.0.2

## 3.0.1

### Patch Changes

- 480e58b: missing pure annotation on constrained arrays
- 69db9c7: include expected content-type in xrpc operation schema
- a53b88a: pull latest Bluesky lexicons
- Updated dependencies [6abad75]
- Updated dependencies [5310da3]
- Updated dependencies [3125bf6]
- Updated dependencies [480e58b]
- Updated dependencies [5ec9a3c]
- Updated dependencies [69db9c7]
  - @atcute/lexicons@1.0.1
  - @atcute/atproto@3.0.1

## 3.0.0

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

### Patch Changes

- af85dca: pull latest Bluesky lexicons
  - @atcute/atproto@3.0.0

## 2.1.1

### Patch Changes

- 2774138: unwrapQuoteEmbed function

## 2.1.0

### Minor Changes

- fd166c3: utility functions for unwrapping embeds from a post

## 2.0.3

### Patch Changes

- cc75e22: pull latest Bluesky lexicons

## 2.0.2

### Patch Changes

- 1baedcf: pull latest Bluesky lexicons

## 2.0.1

### Patch Changes

- 4f59252: pull latest Bluesky lexicons

## 2.0.0

### Major Changes

- a47373f: add `At.Identifier` string type

  an alias for either `At.DID` or `At.Handle`

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

- 13f35e4: allow passing ReadableStream and ArrayBuffer as input
- 45cfe46: add new response field, deprecating the old output field

### Patch Changes

- ecce2c6: pull latest Bluesky lexicons
- Updated dependencies [9d05dfd]
- Updated dependencies [13f35e4]
- Updated dependencies [a47373f]
- Updated dependencies [45cc699]
- Updated dependencies [2d10bd8]
- Updated dependencies [8aedcc5]
- Updated dependencies [45cfe46]
- Updated dependencies [813679f]
- Updated dependencies [24be9be]
- Updated dependencies [d3fbc7e]
- Updated dependencies [c7e8573]
- Updated dependencies [61bd8d2]
- Updated dependencies [87a99f1]
  - @atcute/client@3.0.0

## 1.0.15

### Patch Changes

- 298189f: pull latest Bluesky lexicons
