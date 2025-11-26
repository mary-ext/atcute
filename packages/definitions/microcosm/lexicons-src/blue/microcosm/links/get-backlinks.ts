import {
	array,
	document,
	integer,
	object,
	params,
	query,
	required,
	string,
} from '@atcute/lexicon-doc/builder';

const linkRecord = object({
	description: 'a record linking to the subject',
	properties: {
		did: required(string({ format: 'did', description: 'the DID of the linking record\'s repository' })),
		collection: required(string({ format: 'nsid', description: 'the collection of the linking record' })),
		rkey: required(string({ format: 'record-key', description: 'the record key of the linking record' })),
	},
});

export default document({
	id: 'blue.microcosm.links.getBacklinks',
	defs: {
		main: query({
			description: 'a list of records linking to any record, identity, or uri',
			parameters: params({
				properties: {
					subject: required(string({ format: 'uri', description: 'the target being linked to (at-uri, did, or uri)' })),
					source: required(string({ description: 'collection and path specification (e.g., \'app.bsky.feed.like:subject.uri\')' })),
					did: array({
						description: 'filter links to those from specific users',
						items: string({ format: 'did' }),
					}),
					limit: integer({
						minimum: 1,
						maximum: 100,
						default: 16,
						description: 'number of results to return',
					}),
				},
			}),
			output: {
				encoding: 'application/json',
				schema: object({
					properties: {
						total: required(integer({ description: 'total number of matching links' })),
						records: required(array({ items: linkRecord })),
						cursor: string({ description: 'pagination cursor' }),
					},
				}),
			},
		}),
		linkRecord,
	},
});
