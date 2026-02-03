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

const countBySubject = object({
	description: 'count of links to a secondary subject',
	properties: {
		subject: required(string({ description: 'the secondary subject being counted' })),
		total: required(integer({ description: 'total number of links to this subject' })),
		distinct: required(integer({ description: 'number of distinct DIDs linking to this subject' })),
	},
});

export default document({
	id: 'blue.microcosm.links.getManyToManyCounts',
	defs: {
		main: query({
			description: 'Constellation: count many-to-many relationships with secondary link paths',
			parameters: params({
				properties: {
					subject: required(
						string({
							format: 'uri',
							description: 'the primary target being linked to (at-uri, did, or uri)',
						}),
					),
					source: required(string({ description: 'collection and path specification for the primary link' })),
					pathToOther: required(
						string({
							description: "path to the secondary link in the many-to-many record (e.g., 'otherThing.uri')",
						}),
					),
					did: array({
						description: 'filter links to those from specific users',
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
						counts_by_other_subject: required(array({ items: countBySubject })),
						cursor: string({ description: 'pagination cursor' }),
					},
				}),
			},
		}),
		countBySubject,
	},
});
