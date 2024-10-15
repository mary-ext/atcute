# @atcute/bluesky-richtext-builder

builder pattern for Bluesky's rich text facets.

```ts
import RichtextBuilder from '@atcute/bluesky-richtext-builder';

const { text, facets } = new RichtextBuilder()
	.addText(`hello, `)
	.addMention(`@user`, 'did:plc:ia76kvnndjutgedggx2ibrem')
	.addText(`! please visit my`)
	.addLink(`website`, 'https://example.com');

text;
// ^? `hello, @user! please visit my website`

facets;
// ^? [{ index: { byteStart: 7, byteEnd: 12 }, ... }, { index: { byteStart: 30, byteEnd: 37 }, ... }];
```
