import { describe, expect, it } from 'vitest';

import { PlcDidDocumentResolver } from './plc.js';

describe('PlcDidDocumentResolver', () => {
	const EXAMPLE_DOCUMENT = {
		'@context': [
			'https://www.w3.org/ns/did/v1',
			'https://w3id.org/security/multikey/v1',
			'https://w3id.org/security/suites/secp256k1-2019/v1',
		],
		id: 'did:plc:ia76kvnndjutgedggx2ibrem',
		alsoKnownAs: ['at://mary.my.id'],
		verificationMethod: [
			{
				id: 'did:plc:ia76kvnndjutgedggx2ibrem#atproto',
				type: 'Multikey',
				controller: 'did:plc:ia76kvnndjutgedggx2ibrem',
				publicKeyMultibase: 'zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG',
			},
		],
		service: [
			{
				id: '#atproto_pds',
				type: 'AtprotoPersonalDataServer',
				serviceEndpoint: 'https://porcini.us-east.host.bsky.network',
			},
		],
	};

	it('resolves DID documents', async () => {
		const resolver = new PlcDidDocumentResolver({
			apiUrl: 'https://test.plc.directory',
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.origin).toBe('https://test.plc.directory');
				expect(decodeURIComponent(url.pathname)).toBe('/did:plc:ia76kvnndjutgedggx2ibrem');

				return Response.json(EXAMPLE_DOCUMENT);
			},
		});

		const doc = await resolver.resolve('did:plc:ia76kvnndjutgedggx2ibrem');
		expect(doc).toEqual({
			'@context': [
				'https://www.w3.org/ns/did/v1',
				'https://w3id.org/security/multikey/v1',
				'https://w3id.org/security/suites/secp256k1-2019/v1',
			],
			id: 'did:plc:ia76kvnndjutgedggx2ibrem',
			alsoKnownAs: ['at://mary.my.id'],
			verificationMethod: [
				{
					id: 'did:plc:ia76kvnndjutgedggx2ibrem#atproto',
					type: 'Multikey',
					controller: 'did:plc:ia76kvnndjutgedggx2ibrem',
					publicKeyMultibase: 'zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG',
				},
			],
			service: [
				{
					id: '#atproto_pds',
					type: 'AtprotoPersonalDataServer',
					serviceEndpoint: 'https://porcini.us-east.host.bsky.network',
				},
			],
		});
	});
});
