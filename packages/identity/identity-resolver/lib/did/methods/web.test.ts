import { describe, expect, it } from 'vitest';

import { FailedDocumentResolutionError, ImproperDidError } from '../../errors.ts';

import { AtprotoWebDidDocumentResolver, WebDidDocumentResolver } from './web.ts';

const ACCEPTED_MEDIA_TYPES = 'application/did+ld+json,application/did+json,application/json';

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
				id: 'did:web:zio.sh#atproto_pds',
				type: 'AtprotoPersonalDataServer',
				serviceEndpoint: 'https://zio.blue',
			},
		],
	};

	it('resolves DID documents without @context', async () => {
		const document = {
			id: 'did:web:discover.bsky.app',
			service: [
				{
					id: '#bsky_fg',
					type: 'BskyFeedGenerator',
					serviceEndpoint: 'https://discover.bsky.app',
				},
			],
		};

		const resolver = new WebDidDocumentResolver({
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.href).toBe('https://discover.bsky.app/.well-known/did.json');

				return Response.json(document);
			},
		});

		const doc = await resolver.resolve('did:web:discover.bsky.app');

		expect(doc).toEqual({
			id: 'did:web:discover.bsky.app',
			service: [
				{
					id: '#bsky_fg',
					type: 'BskyFeedGenerator',
					serviceEndpoint: 'https://discover.bsky.app',
				},
			],
		});
	});

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

	it('advertises the did document media types', async () => {
		let accept: string | null = null;

		const resolver = new WebDidDocumentResolver({
			async fetch(input, init) {
				accept = new Request(input, init).headers.get('accept');
				return Response.json(EXAMPLE_DOCUMENT);
			},
		});

		await resolver.resolve('did:web:zio.sh');
		expect(accept).toBe(ACCEPTED_MEDIA_TYPES);
	});

	describe('content types', () => {
		const createResolver = (contentType: string): WebDidDocumentResolver => {
			return new WebDidDocumentResolver({
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

			const doc = await resolver.resolve('did:web:zio.sh');
			expect(doc.id).toBe('did:web:zio.sh');
		});

		it.each(['application/problem+json', 'text/html'])('rejects %s', async (contentType) => {
			const resolver = createResolver(contentType);

			await expect(resolver.resolve('did:web:zio.sh')).rejects.toThrow(FailedDocumentResolutionError);
		});
	});
});

describe('AtprotoWebDidDocumentResolver', () => {
	const EXAMPLE_DOCUMENT = {
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
	};

	it('resolves DID documents', async () => {
		const resolver = new AtprotoWebDidDocumentResolver({
			async fetch(input, init) {
				const request = new Request(input, init);

				expect(new URL(request.url).href).toBe('https://zio.sh/.well-known/did.json');
				expect(request.headers.get('accept')).toBe(ACCEPTED_MEDIA_TYPES);

				return Response.json(EXAMPLE_DOCUMENT, { headers: { 'content-type': 'application/did+json' } });
			},
		});

		const doc = await resolver.resolve('did:web:zio.sh');
		expect(doc).toEqual(EXAMPLE_DOCUMENT);
	});

	it('rejects DIDs with paths', async () => {
		const resolver = new AtprotoWebDidDocumentResolver({
			async fetch() {
				expect.fail('should not have been fetched');
			},
		});

		await expect(resolver.resolve('did:web:zio.sh:foo')).rejects.toThrow(ImproperDidError);
	});
});
