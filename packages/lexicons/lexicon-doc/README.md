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

## validations API

this package provides remote schema validation functionality

```ts
import { RecordValidator } from '@atcute/lexicon-doc/validations';

// lexicon documents retrieved from the network or loaded from disk
const docs = {
	'app.bsky.feed.post': {
		lexicon: 1,
		id: 'app.bsky.feed.post',
		defs: {
			main: {
				type: 'record',
				record: {
					type: 'object',
					required: ['text', 'createdAt'],
					properties: {
						text: { type: 'string', maxLength: 300 },
						createdAt: { type: 'string', format: 'datetime' },
					},
				},
			},
		},
	},
};

const validator = new RecordValidator(docs, 'app.bsky.feed.post');

validator.parse({
	key: '3m6bkzurm4c7w',
	object: {
		$type: 'app.bsky.feed.post',
		text: 'hello world',
		createdAt: '2024-01-01T00:00:00.000Z',
	},
});
```

## JSON schema

this package also provides JSON schemas for authoring lexicon documents, add a `$schema` property to
your document:

```json
{
	"$schema": "https://unpkg.com/@atcute/lexicon-doc/schema/lexicon-doc.schema.json",
	"lexicon": 1,
	"id": "com.example.link",
	"defs": {
		"main": {
			"type": "record",
			"description": "a link submission",
			"key": "tid",
			"record": {
				"type": "object",
				"required": ["url", "createdAt"],
				"properties": {
					"title": { "type": "string", "maxLength": 300 },
					"url": { "type": "string", "format": "uri" },
					"createdAt": { "type": "string", "format": "datetime" }
				}
			}
		}
	}
}
```
