# @atcute/bluesky

[Bluesky](https://bsky.app) type definitions for `@atcute/client`, a lightweight and cute API client
for AT Protocol.

## usage

you'd need to import `@atcute/bluesky/lexicons` into your project, either by adding it into the
`types` field in `tsconfig.json` or by importing it on your source code.

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/bluesky/lexicons"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/bluesky/lexicons" />
```

```ts
// index.ts
import '@atcute/bluesky/lexicons';
```

newly added lexicons are augmented to `@atcute/client/lexicons` module

```ts
import type { AppBskyFeedPost, AppBskyRichtextFacet, Brand } from '@atcute/client/lexicons';

type Facet = AppBskyRichtextFacet.Main;
type MentionFeature = Brand.Union<AppBskyRichtextFacet.Mention>;

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

const record: AppBskyFeedPost.Record = {
	$type: 'app.bsky.feed.post',
	text: `hello @bsky.app!`,
	facets: [facet],
	createdAt: new Date().toISOString(),
};
```

```ts
const rpc = new XRPC({ handle: simpleFetchHandler({ service: 'https://api.bsky.app' }) });

const { data } = await rpc.get('app.bsky.actor.getProfile', {
	params: {
		actor: 'did:plc:z72i7hdynmk6r22z27h6tvur',
	},
});

data;
// -> { handle: 'bsky.app', displayName: 'Bluesky', ... }
```
