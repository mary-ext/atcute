# @atcute/lexicon-doc

type definitions and schemas for atproto lexicon documents

```ts
import { findExternalReferences, lexiconDoc } from '@atcute/lexicon-doc';

const rawDoc = {
	lexicon: 1,
	id: 'com.example.post',
	defs: {
		main: {
			type: 'record',
			key: 'tid',
			record: {
				type: 'object',
				required: ['text', 'createdAt', 'author'],
				properties: {
					text: { type: 'string', maxLength: 300 },
					createdAt: { type: 'string', format: 'datetime' },
					replyTo: { type: 'ref', ref: 'com.atproto.repo.strongRef' },
				},
			},
		},
	},
};

const doc = lexiconDoc.parse(rawDoc, { mode: 'passthrough' });
//    ^? LexiconDoc

const refs = findExternalReferences(doc);
//    ^? Set<string> { 'com.atproto.repo.strongRef' }
```

## builder API

this package provides builder functions for easy authoring of lexicon documents

```ts
import { document, record, object, string, required, build } from '@atcute/lexicon-doc/builder';

const post = document({
	id: 'com.example.post',
	defs: {
		main: record({
			key: 'tid',
			record: object({
				properties: {
					text: required(string({ maxLength: 300 })),
					createdAt: required(string({ format: 'datetime' })),
				},
			}),
		}),
	},
});

const lexicons = build({ documents: [post] });
//    ^? { 'com.example.post': { lexicon: 1, ... } }
```
