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

export default document({
	id: 'blue.microcosm.links.getBacklinkDids',
	defs: {
		main: query({
			description:
				'Constellation: a list of distinct DIDs with records linking to a target at a specified path',
			parameters: params({
				properties: {
					subject: required(
						string({ format: 'uri', description: 'the target being linked to (at-uri, did, or uri)' }),
					),
					source: required(
						string({
							description: "collection and path specification (e.g., 'app.bsky.feed.like:subject.uri')",
						}),
					),
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
						linking_dids: required(array({ items: string({ format: 'did' }) })),
						cursor: string({ description: 'pagination cursor' }),
					},
				}),
			},
		}),
	},
});
