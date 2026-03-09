import { document, integer, object, params, query, required, string } from '@atcute/lexicon-doc/builder';

export default document({
	id: 'blue.microcosm.links.getBacklinksCount',
	defs: {
		main: query({
			description: 'Constellation: count records that link to another record',
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
				},
			}),
			output: {
				encoding: 'application/json',
				schema: object({
					properties: {
						total: required(integer({ description: 'total number of matching links' })),
					},
				}),
			},
		}),
	},
});
