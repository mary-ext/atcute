# @atcute/leaflet

[Leaflet](https://leaflet.pub/) (pub.leaflet.\*) schema definitions

## usage

```ts
import { PubLeafletDocument } from '@atcute/leaflet';
import { is } from '@atcute/lexicons';

const document: PubLeafletDocument.Main = {
	$type: 'pub.leaflet.document',
	title: 'Article title',
	author: 'did:plc:ia76kvnndjutgedggx2ibrem',
	description: 'Article description',
	publication: 'at://did:plc:ia76kvnndjutgedggx2ibrem/pub.leaflet.publication/3lpyvgcwc722m',
	publishedAt: '2025-05-25T14:44:37.870Z',
	pages: [
		{
			$type: 'pub.leaflet.pages.linearDocument',
			blocks: [
				{
					$type: 'pub.leaflet.pages.linearDocument#block',
					block: {
						$type: 'pub.leaflet.blocks.text',
						facets: [{ index: { byteEnd: 12, byteStart: 0 }, features: [] }],
						plaintext: 'Hello world!',
					},
				},
				{
					$type: 'pub.leaflet.pages.linearDocument#block',
					block: {
						$type: 'pub.leaflet.blocks.text',
						facets: [
							{
								index: { byteEnd: 9, byteStart: 0 },
								features: [{ $type: 'pub.leaflet.richtext.facet#bold' }],
							},
						],
						plaintext: 'Bold text',
					},
				},
				{
					$type: 'pub.leaflet.pages.linearDocument#block',
					block: {
						$type: 'pub.leaflet.blocks.text',
						facets: [
							{
								index: { byteEnd: 11, byteStart: 0 },
								features: [{ $type: 'pub.leaflet.richtext.facet#italic' }],
							},
						],
						plaintext: 'Italic text',
					},
				},
				{
					$type: 'pub.leaflet.pages.linearDocument#block',
					block: {
						$type: 'pub.leaflet.blocks.text',
						facets: [
							{
								index: { byteEnd: 16, byteStart: 0 },
								features: [
									{ $type: 'pub.leaflet.richtext.facet#bold' },
									{ $type: 'pub.leaflet.richtext.facet#italic' },
								],
							},
						],
						plaintext: 'Bold italic text',
					},
				},
				{
					$type: 'pub.leaflet.pages.linearDocument#block',
					block: { $type: 'pub.leaflet.blocks.text', facets: [], plaintext: '' },
				},
			],
		},
	],
};

is(PubLeafletDocument.mainSchema, document);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/leaflet"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/leaflet" />
```

```ts
// index.ts
import type {} from '@atcute/leaflet';
```

now all the XRPC operations should be visible in the client
