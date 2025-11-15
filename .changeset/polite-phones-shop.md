---
'@atcute/lexicon-doc': minor
---

new builder API for easy authoring of lexicon documents

here's an example representing how a basic rich text document could've looked (inspired by Leaflet.)

```ts
// color.ts
import { document, integer, object, required, union } from '@atcute/lexicon-doc/builder';

const channel = integer({ minimum: 0, maximum: 255 });
const alpha = integer({ minimum: 0, maximum: 100 });

export const rgb = object({
	properties: {
		r: required(channel),
		g: required(channel),
		b: required(channel),
	},
});

export const rgba = object({
	properties: {
		r: required(channel),
		g: required(channel),
		b: required(channel),
		a: required(alpha),
	},
});

export const anyColor = union({ refs: [rgb, rgba] });

export default document({
	id: 'com.example.color',
	defs: { rgb, rgba },
});

// text-block.ts
import { document, object, string, token, required } from '@atcute/lexicon-doc/builder';

export const alignStart = token();
export const alignCenter = token();
export const alignEnd = token();

export const main = object({
	properties: {
		content: required(string()),
		alignment: string({
			default: alignStart,
			knownValues: [alignCenter, alignCenter, alignRight],
		}),
	},
});

export default document({
	id: 'com.example.text-block',
	defs: { main, alignStart, alignCenter, alignEnd },
});

// document.ts
import { array, document, object, record, required, string } from '@atcute/lexicon-doc/builder';

import { anyColor } from './color.ts';
import { main as textBlock } from './text-block.ts';

export const main = record({
	key: 'tid',
	record: object({
		properties: {
			title: required(string({ maxLength: 300 })),
			backgroundColor: anyColor,
			blocks: required(
				array({
					items: union({
						refs: [textBlock],
					}),
				}),
			),
		},
	}),
});

export default document({
	id: 'com.example.document',
	defs: { main },
});
```

you'd then call `build()` to get the final lexicon documents

```ts
import { build } from '@atcute/lexicon-doc/builder';

import colorDoc from './color.ts';
import textBlockDoc from './text-block.ts';
import documentDoc from './document.ts';

const lexicons = build({ documents: [colorDoc, textBlockDoc, documentDoc] });
//    ^? { 'com.example.color': { lexicon: 1, ... } }
```
