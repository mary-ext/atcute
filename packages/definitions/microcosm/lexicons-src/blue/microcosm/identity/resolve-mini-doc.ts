import { document, object, params, query, required, string } from '@atcute/lexicon-doc/builder';

export default document({
	id: 'blue.microcosm.identity.resolveMiniDoc',
	defs: {
		main: query({
			description:
				'Slingshot: like com.atproto.identity.resolveIdentity but instead of the full didDoc it returns an atproto-relevant subset',
			parameters: params({
				properties: {
					identifier: required(string({ format: 'at-identifier', description: 'handle or DID to resolve' })),
				},
			}),
			output: {
				encoding: 'application/json',
				schema: object({
					properties: {
						did: required(
							string({
								format: 'did',
								description: 'DID, bi-directionally verified if a handle was provided in the query',
							}),
						),
						handle: required(
							string({
								format: 'handle',
								description:
									"the validated handle of the account or 'handle.invalid' if the handle did not bi-directionally match the DID document",
							}),
						),
						pds: required(string({ format: 'uri', description: "the identity's PDS URL" })),
						signing_key: required(string({ description: 'the atproto signing key publicKeyMultibase' })),
					},
				}),
			},
		}),
	},
});
