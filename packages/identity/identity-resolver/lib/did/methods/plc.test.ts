import { getAtprotoVerificationMaterial, getPdsEndpoint } from '@atcute/identity';

import { describe, expect, it } from 'vitest';

import { FailedDocumentResolutionError } from '../../errors.ts';

import { PlcDidDocumentResolver } from './plc.ts';

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

	it('advertises the did document media types', async () => {
		let accept: string | null = null;

		const resolver = new PlcDidDocumentResolver({
			async fetch(input, init) {
				accept = new Request(input, init).headers.get('accept');
				return Response.json(EXAMPLE_DOCUMENT);
			},
		});

		await resolver.resolve('did:plc:ia76kvnndjutgedggx2ibrem');
		expect(accept).toBe('application/did+ld+json,application/did+json,application/json');
	});

	describe('content types', () => {
		const createResolver = (contentType: string): PlcDidDocumentResolver => {
			return new PlcDidDocumentResolver({
				async fetch() {
					return Response.json(EXAMPLE_DOCUMENT, { headers: { 'content-type': contentType } });
				},
			});
		};

		it.each([
			'application/did+json',
			'application/did+ld+json',
			'application/json',
			// media types are case-insensitive and may carry parameters
			'Application/DID+JSON; charset=utf-8',
		])('accepts %s', async (contentType) => {
			const resolver = createResolver(contentType);

			const doc = await resolver.resolve('did:plc:ia76kvnndjutgedggx2ibrem');
			expect(doc.id).toBe('did:plc:ia76kvnndjutgedggx2ibrem');
		});

		it.each(['application/problem+json', 'text/html'])('rejects %s', async (contentType) => {
			const resolver = createResolver(contentType);

			await expect(resolver.resolve('did:plc:ia76kvnndjutgedggx2ibrem')).rejects.toThrow(
				FailedDocumentResolutionError,
			);
		});
	});

	// https://github.com/did-method-plc/go-didplc/tree/main/cmd/plc-replica#did-document-format-differences
	it('resolves documents served by a plc replica', async () => {
		const resolver = new PlcDidDocumentResolver({
			async fetch() {
				const document = {
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
							id: 'did:plc:ia76kvnndjutgedggx2ibrem#atproto_pds',
							type: 'AtprotoPersonalDataServer',
							serviceEndpoint: 'https://porcini.us-east.host.bsky.network',
						},
					],
				};

				return Response.json(document, { headers: { 'content-type': 'application/did+json' } });
			},
		});

		const doc = await resolver.resolve('did:plc:ia76kvnndjutgedggx2ibrem');

		expect(doc['@context']).toBeUndefined();
		expect(getPdsEndpoint(doc)).toBe('https://porcini.us-east.host.bsky.network');
		expect(getAtprotoVerificationMaterial(doc)).toEqual({
			type: 'Multikey',
			publicKeyMultibase: 'zQ3shuqiNQXNGKBBbNvPhcaZy8DjP3BF3yhmSeAjFXQjgPJrG',
		});
	});
});
