import { document, object, procedure, required, string } from '@atcute/lexicon-doc/builder';

const input = object({
	properties: {
		aud: required(string({ description: 'authorization server issuer' })),
	},
});

const output = object({
	properties: {
		client_assertion: required(string({ description: 'signed JWT assertion' })),
	},
});

export default document({
	id: 'dev.atcute.oauth.getClientAssertion',
	defs: {
		main: procedure({
			description: 'get a DPoP-bound client assertion for OAuth token requests',
			input: { encoding: 'application/json', schema: input },
			output: { encoding: 'application/json', schema: output },
			errors: [
				{ name: 'InvalidDpopProof', description: 'DPoP proof is missing or invalid' },
				{ name: 'UseDpopNonce', description: 'retry with the provided DPoP-Nonce' },
			],
		}),
	},
});
