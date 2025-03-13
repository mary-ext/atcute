import { describe, expect, it } from 'bun:test';

import { WebDidDocumentResolver } from './web.js';

describe('WebDidDocumentResolver', () => {
	const EXAMPLE_DOCUMENT = {
		'@context': [
			'https://www.w3.org/ns/did/v1',
			'https://w3id.org/security/multikey/v1',
			'https://w3id.org/security/suites/secp256k1-2019/v1',
		],
		id: 'did:web:zio.sh',
		alsoKnownAs: ['at://zio.sh'],
		verificationMethod: [
			{
				id: 'did:web:zio.sh#atproto',
				type: 'Multikey',
				controller: 'did:web:zio.sh',
				publicKeyMultibase: 'zQ3shYEDEccT7pgACkXem3Uh15EBEfxukQYGAxw617oMqck3T',
			},
		],
		service: [
			{
				id: '#atproto_pds',
				type: 'AtprotoPersonalDataServer',
				serviceEndpoint: 'https://zio.blue',
			},
		],
	};

	it('resolves DID documents', async () => {
		const resolver = new WebDidDocumentResolver({
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.href).toBe('https://zio.sh/.well-known/did.json');

				return Response.json(EXAMPLE_DOCUMENT);
			},
		});

		const doc = await resolver.resolve('did:web:zio.sh');

		expect(doc).toEqual({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:web:zio.sh',
			alsoKnownAs: ['at://zio.sh'],
			verificationMethod: [
				{
					id: 'did:web:zio.sh#atproto',
					type: 'Multikey',
					controller: 'did:web:zio.sh',
					publicKeyMultibase: 'zQ3shYEDEccT7pgACkXem3Uh15EBEfxukQYGAxw617oMqck3T',
				},
			],
			service: [
				{
					id: 'did:web:zio.sh#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://zio.blue',
				},
			],
		});
	});
});
