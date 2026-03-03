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
	description: 'a record identifier consisting of a DID, collection, and record key',
	properties: {
		did: required(string({ format: 'did', description: "the DID of the linking record's repository" })),
		collection: required(string({ format: 'nsid', description: 'the collection of the linking record' })),
		rkey: required(string({ format: 'record-key' })),
	},
});

const item = object({
	properties: {
		linkRecord: required(linkRecord),
		otherSubject: required(string({ description: 'the secondary subject from the link record' })),
	},
});

export default document({
	id: 'blue.microcosm.links.getManyToMany',
	defs: {
		main: query({
			description: 'Constellation: get records that link out to both a primary and secondary subject',
			parameters: params({
				properties: {
					subject: required(
						string({
							format: 'uri',
							description: 'the primary target being linked to (at-uri, did, or uri)',
						}),
					),
					source: required(
						string({
							description:
								"collection and path specification for the primary link (e.g., 'app.bsky.feed.like:subject.uri')",
						}),
					),
					pathToOther: required(
						string({
							description: "path to the secondary link in the many-to-many record (e.g., 'otherThing.uri')",
						}),
					),
					linkDid: array({
						description: 'filter linking records from specific users',
						items: string({ format: 'did' }),
					}),
					otherSubject: array({
						description: 'filter secondary links to specific subjects',
						items: string(),
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
						items: required(array({ items: item })),
						cursor: string(),
					},
				}),
			},
		}),
		item,
		linkRecord,
	},
});
