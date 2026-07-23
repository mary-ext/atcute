# @atcute/bluesky

## 4.0.15

### Patch Changes

- d67ddd1: pull latest Bluesky lexicons

## 4.0.14

### Patch Changes

- d175d7e: pull latest Bluesky lexicons

## 4.0.13

### Patch Changes

- 16a47b9: pull latest Bluesky lexicons

## 4.0.12

### Patch Changes

- 31a3a0b: drop sourcemaps and raw source files from publish
- Updated dependencies [31a3a0b]
  - @atcute/atproto@4.0.3
  - @atcute/lexicons@2.0.2

## 4.0.11

### Patch Changes

- 46b483d: pull latest Bluesky lexicons

## 4.0.10

### Patch Changes

- 6e86fd1: pull latest Bluesky lexicons

## 4.0.9

### Patch Changes

- a01f3f5: pull latest Bluesky lexicons

## 4.0.8

### Patch Changes

- d05fdce: pull latest Bluesky lexicons

## 4.0.7

### Patch Changes

- e577e91: add `app.bsky.embed.gallery` limits
- 4ce627c: pull latest Bluesky lexicons

## 4.0.6

### Patch Changes

- d0c6362: pull latest Bluesky lexicons
- 713c9ae: pull latest Bluesky lexicons

## 4.0.5

### Patch Changes

- a836d6a: declare `sideEffects: false` so bundlers can tree-shake unused schema modules pulled in
  through the barrel
- Updated dependencies [a836d6a]
  - @atcute/atproto@4.0.2

## 4.0.4

### Patch Changes

- 24696c1: pull latest Bluesky lexicons

## 4.0.3

### Patch Changes

- 65ced9c: pull latest Bluesky lexicons
- 2fdf098: pull latest Bluesky lexicons

## 4.0.2

### Patch Changes

- 8c57b20: pull latest Bluesky lexicons

## 4.0.1

### Patch Changes

- 63526b6: pull latest Bluesky lexicons

## 4.0.0

### Patch Changes

- Updated dependencies [d64ddf1]
  - @atcute/lexicons@2.0.0
  - @atcute/atproto@4.0.0

## 3.3.5

### Patch Changes

- 0db4e5a: pull latest Bluesky lexicons

## 3.3.4

### Patch Changes

- 1f35101: pull latest Bluesky lexicons
- d174298: mark some dependencies as peer dependencies to avoid breakages in the future.
- Updated dependencies [d174298]
- Updated dependencies [87c00bb]
- Updated dependencies [8b6c404]
  - @atcute/atproto@3.1.12
  - @atcute/lexicons@1.3.1

## 3.3.3

### Patch Changes

- c75fe0b: pull latest Bluesky lexicons

## 3.3.2

### Patch Changes

- 9e6b3f6: pull latest Bluesky lexicons
- 43b2d76: regenerate with blob constraints
- Updated dependencies [94065a1]
  - @atcute/lexicons@1.3.0

## 3.3.1

### Patch Changes

- 5e638d5: pull latest Bluesky lexicons
- Updated dependencies [4b99ff8]
- Updated dependencies [2022754]
  - @atcute/atproto@3.1.11
  - @atcute/lexicons@1.2.10

## 3.3.0

### Minor Changes

- 962ef11: expose record and embed limits as constants

  this is a bit of an experiment, the library now exposes the limits set by records and interfaces
  and exposes them as constants that you could easily pull in to your clients.

  ```ts
  import { feedPost } from '@atcute/bluesky/limits';

  // check if post text exceeds the limit
  if (getGraphemeLength(text) > feedPost.text.maxGraphemes) {
  	// text is too long
  }
  ```

## 3.2.21

### Patch Changes

- c7dbefe: pull latest Bluesky lexicons

## 3.2.20

### Patch Changes

- 3bf9240: pull latest Bluesky lexicons

## 3.2.19

### Patch Changes

- c64e83b: pull latest Bluesky lexicons

## 3.2.18

### Patch Changes

- 4cc8c50: pull latest Bluesky lexicons

## 3.2.17

### Patch Changes

- 3202809: pull latest Bluesky lexicons

## 3.2.16

### Patch Changes

- a6191a0: pull latest Bluesky lexicons
- Updated dependencies [e73fddf]
  - @atcute/lexicons@1.2.7

## 3.2.15

### Patch Changes

- 9608fb7: pull latest Bluesky lexicons
- 96fbbad: pull latest Bluesky lexicons

## 3.2.14

### Patch Changes

- f0c0844: pull latest Bluesky lexicons

## 3.2.13

### Patch Changes

- 9459e91: pull latest Bluesky lexicons

## 3.2.12

### Patch Changes

- 45fdf38: pull latest Bluesky lexicons

## 3.2.11

### Patch Changes

- 2cb057b: pull latest Bluesky lexicons
- Updated dependencies [03a13b3]
  - @atcute/lexicons@1.2.5

## 3.2.10

### Patch Changes

- 8b5d7e0: pull latest Bluesky lexicons
- Updated dependencies [8b5d7e0]
  - @atcute/atproto@3.1.9

## 3.2.9

### Patch Changes

- 4723171: pull latest Bluesky lexicons

## 3.2.8

### Patch Changes

- 1429438: add `atcute:lexicons` metadata to package.json

  all lexicon definition packages now include the `atcute:lexicons` field with namespace mappings,
  enabling automatic import resolution when used with `@atcute/lex-cli`'s `imports` configuration.

- Updated dependencies [1429438]
  - @atcute/atproto@3.1.8

## 3.2.7

### Patch Changes

- 8af50f3: pull latest Bluesky lexicons

## 3.2.6

### Patch Changes

- 8f4bd4b: add JSDoc to object fields
- Updated dependencies [8f4bd4b]
  - @atcute/atproto@3.1.7

## 3.2.5

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [17c6f4a]
- Updated dependencies [b30da0e]
  - @atcute/lexicons@1.2.2
  - @atcute/atproto@3.1.6

## 3.2.4

### Patch Changes

- bb8dd3b: pull latest Bluesky lexicons
- b2e8c17: pull latest Bluesky lexicons
- Updated dependencies [b2e8c17]
  - @atcute/atproto@3.1.5

## 3.2.3

### Patch Changes

- b30bc04: pull latest Bluesky lexicons

## 3.2.2

### Patch Changes

- c3e2999: pull latest Bluesky lexicons
- Updated dependencies [c3e2999]
  - @atcute/atproto@3.1.3

## 3.2.1

### Patch Changes

- a53bc05: pull latest Bluesky lexicons
- Updated dependencies [394080c]
- Updated dependencies [a53bc05]
  - @atcute/lexicons@1.1.1
  - @atcute/atproto@3.1.2

## 3.2.0

### Minor Changes

- 037d155: add `AnyListView`, `AnyProfileView` and `AnyStarterPackView` for convenience

### Patch Changes

- 730e3e9: add missing JSDoc annotations for exported embed types
- 66ea1a9: pull latest Bluesky lexicons

## 3.1.5

### Patch Changes

- fa6146b: pull latest Bluesky lexicons
- 8d0b416: pull latest Bluesky lexicons
- Updated dependencies [fa6146b]
  - @atcute/atproto@3.1.1

## 3.1.4

### Patch Changes

- 13f8dd9: pull latest Bluesky lexicons

## 3.1.3

### Patch Changes

- 01fe46e: pull latest Bluesky lexicons
- Updated dependencies [dee1e70]
- Updated dependencies [cfbbc3e]
- Updated dependencies [c061b2a]
- Updated dependencies [7b590bd]
- Updated dependencies [5383f0c]
- Updated dependencies [19731f4]
- Updated dependencies [aafe153]
  - @atcute/lexicons@1.1.0
  - @atcute/atproto@3.1.1

## 3.1.2

### Patch Changes

- 74db1f1: pull latest Bluesky lexicons

## 3.1.1

### Patch Changes

- e88a976: pull latest Bluesky lexicons
- ad6d90b: pull latest Bluesky lexicons

## 3.1.0

### Minor Changes

- e8592d0: bring back convenient interfaces for XRPC operations

  in hindsight, it was a big mistake making substituting `AppBskyFeedGetTimeline.Output` for
  `InferXRPCBodyInput<AppBskyFeedGetTimeline.mainSchema['output']>`!

  the change was prompted because lexicon documents do not reserve names for the code generator's
  types, you could have a document defining a query and a type named `output`, and you'd basically
  wreck havoc on the codegen itself.

  but clearly these convenient interfaces are still worth having, so while it now exists, the
  compromise is that these interfaces now have been renamed to ensure they don't conflict with any
  definitions ever:
  - `Params` to `$params`, for query parameters
  - `Input` to `$input`, for request body
  - `Output` to `$output`, for response body

### Patch Changes

- Updated dependencies [e8592d0]
  - @atcute/atproto@3.1.0

## 3.0.4

### Patch Changes

- c07b5a7: pull latest Bluesky lexicons
- 30ccef3: set a minimum constraint of 1 array items for XRPC parameters
- Updated dependencies [a2dbb16]
- Updated dependencies [9ef363f]
- Updated dependencies [30ccef3]
  - @atcute/lexicons@1.0.4
  - @atcute/atproto@3.0.3

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
