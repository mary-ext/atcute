---
'@atcute/whitewind': major
'@atcute/bluemoji': major
'@atcute/bluesky': major
'@atcute/ozone': major
'@atcute/client': major
---

a major change to how types are consumed, and schema validation!

this change is pretty big, where it used to be that `@atcute/client` would ship type definitions for
core lexicon types (`At.Did`, `At.ResourceUri`, `At.CidLink` and so on) and `com.atproto.*`
interfaces, they're now decoupled into their own packages:

- `@atcute/lexicons` for core lexicon types
- `@atcute/atproto` for `com.atproto.*` interfaces

when upgrading `@atcute/client`, you must now install `@atcute/lexicons`. if you use any types from
`com.atproto.*`, then you'd need to install `@atcute/atproto` as well.

migration notes:

- the `At` namespace is gone, you can import `Did`, `ResourceUri` and many other core types directly
  from `@atcute/lexicons`

  ```ts
  import type { Did } from '@atcute/lexicons';
  import type { AppBskyActorDefs } from '@atcute/bluesky';

  export const findAllProfiles = (did: Did): AppBskyActorDefs.ProfileView[] => {
  	// ...
  };
  ```

- interfaces now use the `$type` field instead of a type-only symbol for branding. consequently the
  `Brand` namespace which contains utilities for dealing with branding is renamed to `$type`, use
  `$type.enforce<>` to enforce the existence of a `$type` field.

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
  output body. use `InferInput`/`InferOutput` and `InferXRPCBodyInput`/`InferXRPCBodyOutput` to get
  them.

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

this change means that downstream consumers that were only relying on `@atcute/client` for its type
definitions no longer are pinned on the versioning of the API client.

that said, this isn't solely about restructuring type interfaces. we now provide runtime schemas and
subsequently schema validation!

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
either client or server. we generate code that allows for static type inference, allowing for client
and servers to consume types from the same package.

these schemas are web-friendly, they are treeshakeable by design, minimizing the impact it has on
your bundle size.

that's all! this whole plan has been almost 8 months in the making, I hope all of this change
benefits the AT Protocol developer community in some way, just as AT Protocol gave me a lot of fun
working with it.
