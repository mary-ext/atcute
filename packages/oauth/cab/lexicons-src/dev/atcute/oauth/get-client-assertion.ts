import { document, object, procedure, required, string } from '@atcute/lexicon-doc/builder';

export default document({
	id: 'dev.atcute.oauth.getClientAssertion',
	defs: {
		main: procedure({
			description: 'get a DPoP-bound client assertion for OAuth token requests',
			input: {
				encoding: 'application/json',
				schema: object({
					properties: {
						aud: required(string({ description: 'authorization server issuer' })),
					},
				}),
			},
			output: {
				encoding: 'application/json',
				schema: object({
					properties: {
						client_assertion: required(string({ description: 'signed JWT assertion' })),
					},
				}),
			},
			errors: [
				{ name: 'InvalidDpopProof', description: 'DPoP proof is missing or invalid' },
				{ name: 'UseDpopNonce', description: 'retry with the provided DPoP-Nonce' },
			],
		}),
	},
});
