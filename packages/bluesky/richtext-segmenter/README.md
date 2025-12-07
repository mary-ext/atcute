# @atcute/bluesky-richtext-segmenter

segments Bluesky rich text into tokens for rendering.

```sh
npm install @atcute/bluesky-richtext-segmenter
```

Bluesky posts contain text and facets (byte-range annotations for mentions, links, etc). this
package splits the text into segments, each with its associated features, so you can render them
appropriately.

## usage

```ts
import { segmentize } from '@atcute/bluesky-richtext-segmenter';

// text and facets from a post record
const text = 'hello @bsky.app!';
const facets = [
	{
		index: { byteStart: 6, byteEnd: 15 },
		features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:z72i7hdynmk6r22z27h6tvur' }],
	},
];

const segments = segmentize(text, facets);
// -> [
//   { text: 'hello ', features: undefined },
//   { text: '@bsky.app', features: [{ $type: '...#mention', did: '...' }] },
//   { text: '!', features: undefined }
// ]
```

### rendering segments

each segment contains `text` and optionally `features`. render based on the feature type:

```tsx
import { segmentize, type RichtextSegment } from '@atcute/bluesky-richtext-segmenter';

const renderSegment = (segment: RichtextSegment, index: number) => {
	const { text, features } = segment;

	if (!features) {
		return <span key={index}>{text}</span>;
	}

	// segments can have multiple features, use the first one
	const feature = features[0];

	switch (feature.$type) {
		case 'app.bsky.richtext.facet#mention':
			return (
				<a key={index} href={`/profile/${feature.did}`}>
					{text}
				</a>
			);

		case 'app.bsky.richtext.facet#link':
			return (
				<a key={index} href={feature.uri} target="_blank" rel="noopener noreferrer">
					{text}
				</a>
			);

		case 'app.bsky.richtext.facet#tag':
			return (
				<a key={index} href={`/search?q=${encodeURIComponent('#' + feature.tag)}`}>
					{text}
				</a>
			);

		default:
			return <span key={index}>{text}</span>;
	}
};

const RichText = ({ text, facets }: { text: string; facets?: Facet[] }) => {
	const segments = segmentize(text, facets);
	return <>{segments.map(renderSegment)}</>;
};
```
