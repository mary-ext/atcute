# @atcute/bluesky-richtext-builder

fluent builder for constructing Bluesky rich text with facets.

```sh
npm install @atcute/bluesky-richtext-builder
```

Bluesky posts support rich text with mentions, links, and hashtags. these are represented as
"facets" - byte ranges with attached features. this package provides a builder that handles the byte
offset calculations for you.

## why use a builder?

Bluesky facets use byte offsets, not character positions. this matters for non-ASCII text:

```ts
// "café" is 5 bytes in UTF-8 (c=1, a=1, f=1, é=2)
const text = 'café ☕';

// the coffee emoji starts at byte 5, not character 5
```

the builder handles these calculations automatically, so you don't have to think about byte offsets.

## usage

### basic usage

```ts
import RichtextBuilder from '@atcute/bluesky-richtext-builder';

const rt = new RichtextBuilder()
	.addText('hello, ')
	.addMention('@alice', 'did:plc:abc123')
	.addText('! check out ')
	.addLink('my website', 'https://example.com');

console.log(rt.text);
// -> "hello, @alice! check out my website"

console.log(rt.facets);
// -> [
//   { index: { byteStart: 7, byteEnd: 13 }, features: [{ $type: 'app.bsky.richtext.facet#mention', did: '...' }] },
//   { index: { byteStart: 25, byteEnd: 35 }, features: [{ $type: 'app.bsky.richtext.facet#link', uri: '...' }] }
// ]
```

### creating a post

use with `@atcute/client` to create a post:

```ts
import { Client, CredentialManager, ok } from '@atcute/client';
import RichtextBuilder from '@atcute/bluesky-richtext-builder';

import type {} from '@atcute/bluesky';

const manager = new CredentialManager({ service: 'https://bsky.social' });
const rpc = new Client({ handler: manager });

await manager.login({ identifier: 'you.bsky.social', password: 'your-app-password' });

const rt = new RichtextBuilder()
	.addText('hello ')
	.addMention('@bsky.app', 'did:plc:z72i7hdynmk6r22z27h6tvur')
	.addText('! ')
	.addTag('atproto');

await ok(
	rpc.post('com.atproto.repo.createRecord', {
		input: {
			repo: manager.session!.did,
			collection: 'app.bsky.feed.post',
			record: {
				$type: 'app.bsky.feed.post',
				text: rt.text,
				facets: rt.facets,
				createdAt: new Date().toISOString(),
			},
		},
	}),
);
```

### adding links

```ts
const rt = new RichtextBuilder()
	.addText('read the ')
	.addLink('documentation', 'https://atproto.com/docs')
	.addText(' for more info');
```

the link text can be anything - it doesn't have to be the URL:

```ts
const rt = new RichtextBuilder().addLink('click here', 'https://example.com');
```

### adding mentions

mentions require both the display text and the user's DID:

```ts
const rt = new RichtextBuilder().addMention('@alice.bsky.social', 'did:plc:abc123');
```

you'll typically resolve the handle to a DID first:

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

const handle = 'alice.bsky.social';
const did = await handleResolver.resolve(handle);

const rt = new RichtextBuilder().addMention(`@${handle}`, did);
```

### adding hashtags

hashtags are added without the `#` prefix - it's added automatically:

```ts
const rt = new RichtextBuilder().addText('loving ').addTag('atproto').addText(' development!');

// text: "loving #atproto development!"
```

### custom facet features

use `addDecoratedText()` for custom facet features:

```ts
import type { FacetFeature } from '@atcute/bluesky-richtext-builder';

const feature: FacetFeature = {
	$type: 'app.bsky.richtext.facet#link',
	uri: 'https://example.com',
};

const rt = new RichtextBuilder().addDecoratedText('custom link', feature);
```

### getting the result

there are multiple ways to get the composed rich text:

```ts
const rt = new RichtextBuilder().addText('hello ').addTag('world');

// via getters
const text = rt.text;
const facets = rt.facets;

// via build() method
const { text, facets } = rt.build();
```

### cloning the builder

clone a builder to create variations:

```ts
const base = new RichtextBuilder().addText('hello ');

const withMention = base.clone().addMention('@alice', 'did:plc:abc');
const withLink = base.clone().addLink('world', 'https://example.com');
```
