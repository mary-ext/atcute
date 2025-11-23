---
'@atcute/lexicon-doc': minor
---

add RecordValidator for record validations using remote schemas

this is useful for PDS implementations that wants to validate a record that a user is putting into
their repository but don't have local copies of its schema.

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
