import { describe, expect, it } from 'vitest';

import {
	AmbiguousAuthorityError,
	AuthorityNotFoundError,
	FailedAuthorityResolutionError,
	InvalidResolvedAuthorityError,
} from '../errors.ts';

import { DohJsonLexiconAuthorityResolver } from './doh-json.ts';

const DOH_URL = 'https://dns.resolver.com/dns-query';

describe('DohJsonLexiconAuthorityResolver', () => {
	it('resolves lexicon authority correctly', async () => {
		const resolver = new DohJsonLexiconAuthorityResolver({
			dohUrl: DOH_URL,
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.host).toBe('dns.resolver.com');
				expect(url.pathname).toBe('/dns-query');

				const fqdn = url.searchParams.get('name');
				const type = url.searchParams.get('type');

				expect(fqdn).toBe('_lexicon.repo.atproto.com');
				expect(type).toBe('TXT');

				return Response.json({
					Status: 0,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_lexicon.repo.atproto.com.', type: 16 }],
					Answer: [
						{
							name: '_lexicon.repo.atproto.com.',
							type: 16,
							TTL: 300,
							data: 'did=did:plc:ia76kvnndjutgedggx2ibrem',
						},
					],
					Comment: 'Hello!',
				});
			},
		});

		const did = await resolver.resolve('com.atproto.repo.createRecord');
		expect(did).toBe('did:plc:ia76kvnndjutgedggx2ibrem');
	});

	it('throws on multiple entries', async () => {
		const resolver = new DohJsonLexiconAuthorityResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 0,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_lexicon.example.com.', type: 16 }],
					Answer: [
						{
							name: '_lexicon.example.com.',
							type: 16,
							TTL: 300,
							data: 'did=did:plc:ia76kvnndjutgedggx2ibrem',
						},
						{
							name: '_lexicon.example.com.',
							type: 16,
							TTL: 300,
							data: 'did=did:plc:ar7c4by46qjdydhdevvrndac',
						},
					],
				});
			},
		});

		let error;
		try {
			await resolver.resolve('com.example.createPost');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AmbiguousAuthorityError);
	});

	it('throws on no entries', async () => {
		const resolver = new DohJsonLexiconAuthorityResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 3, // NXDOMAIN
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_lexicon.example.com.', type: 16 }],
					Authority: [
						{
							name: 'example.com.',
							type: 6,
							TTL: 1800,
							data: 'deborah.ns.cloudflare.com. dns.cloudflare.com. 2363900468 10000 2400 604800 1800',
						},
					],
				});
			},
		});

		let error;
		try {
			await resolver.resolve('com.example.createPost');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthorityNotFoundError);
	});

	it('throws on non-atproto dids', async () => {
		const resolver = new DohJsonLexiconAuthorityResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 0,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_lexicon.example.com.', type: 16 }],
					Answer: [{ name: '_lexicon.example.com.', type: 16, TTL: 300, data: 'did=did:example:123' }],
				});
			},
		});

		let error;
		try {
			await resolver.resolve('com.example.createPost');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(InvalidResolvedAuthorityError);
	});

	it('throws on network error', async () => {
		const resolver = new DohJsonLexiconAuthorityResolver({
			dohUrl: DOH_URL,
			async fetch() {
				throw new TypeError('Network error');
			},
		});

		let error;
		try {
			await resolver.resolve('com.example.createPost');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(FailedAuthorityResolutionError);
		expect((error as Error).cause).toBeInstanceOf(TypeError);
	});

	it('throws on non-ok DNS response', async () => {
		const resolver = new DohJsonLexiconAuthorityResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 1, // FORMERR
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_lexicon.example.com.', type: 16 }],
					Answer: [
						{
							name: '_lexicon.example.com.',
							type: 16,
							TTL: 300,
							data: 'did=did:plc:ia76kvnndjutgedggx2ibrem',
						},
					],
				});
			},
		});

		let error;
		try {
			await resolver.resolve('com.example.createPost');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(FailedAuthorityResolutionError);
		expect((error as Error).cause).toBeInstanceOf(TypeError);
	});
});
