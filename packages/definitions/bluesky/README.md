# @atcute/bluesky

[Bluesky](https://bsky.app) (app.bsky.\* and chat.bsky.\*) schema definitions

## usage

```ts
import { is, type $type } from '@atcute/lexicons';
import { AppBskyFeedPost, AppBskyRichtextFacet } from '@atcute/bluesky';

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

const record: AppBskyFeedPost.Main = {
	$type: 'app.bsky.feed.post',
	text: `hello @bsky.app!`,
	facets: [facet],
	createdAt: new Date().toISOString(),
};

is(AppBskyFeedPost.mainSchema, record);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// file: tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/bluesky"],
	},
}
```

```ts
// file: env.d.ts
/// <reference types="@atcute/bluesky" />
```

```ts
// file: index.ts
import type {} from '@atcute/bluesky';
```

now all the XRPC operations should be visible in the client

```ts
import { Client, simpleFetchHandler } from '@atcute/client';

const client = new Client({
	handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
});

const response = await client.get('app.bsky.actor.getProfile', {
	params: {
		actor: 'did:plc:z72i7hdynmk6r22z27h6tvur',
	},
});
// ...
```

## with `@atcute/lex-cli`

when building your own lexicons that reference Bluesky types, configure lex-cli to import from this
package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	mappings: [
		{
			nsid: ['app.bsky.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('app.bsky.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/bluesky/types/app/${specifier}` };
			},
		},
		{
			nsid: ['chat.bsky.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('chat.bsky.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/bluesky/types/chat/${specifier}` };
			},
		},
	],
});
```
