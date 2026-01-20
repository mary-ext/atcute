import { describe, expect, it } from 'vitest';

import {
	AmbiguousHandleError,
	DidNotFoundError,
	FailedHandleResolutionError,
	InvalidResolvedHandleError,
} from '../../errors.js';

import { DohJsonHandleResolver } from './doh-json.js';

const DOH_URL = 'https://dns.resolver.com/dns-query';

describe('DohJsonHandleResolver', () => {
	it('resolves handle correctly', async () => {
		const resolver = new DohJsonHandleResolver({
			dohUrl: DOH_URL,
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.host).toBe('dns.resolver.com');
				expect(url.pathname).toBe('/dns-query');

				const fqdn = url.searchParams.get('name');
				const type = url.searchParams.get('type');

				expect(fqdn).toBe('_atproto.example.com');
				expect(type).toBe('TXT');

				return Response.json({
					Status: 0,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_atproto.example.com.', type: 16 }],
					Answer: [
						{
							name: '_atproto.example.com.',
							type: 16,
							TTL: 300,
							data: 'did=did:plc:ia76kvnndjutgedggx2ibrem',
						},
					],
					Comment: 'Hello!',
				});
			},
		});

		const did = await resolver.resolve('example.com');
		expect(did).toBe('did:plc:ia76kvnndjutgedggx2ibrem');
	});

	it('throws on multiple entries', async () => {
		const resolver = new DohJsonHandleResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 0,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_atproto.example.com.', type: 16 }],
					Answer: [
						{
							name: '_atproto.example.com.',
							type: 16,
							TTL: 300,
							data: 'did=did:plc:ia76kvnndjutgedggx2ibrem',
						},
						{
							name: '_atproto.example.com.',
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
			await resolver.resolve('example.com');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AmbiguousHandleError);
	});

	it('throws on no entries', async () => {
		const resolver = new DohJsonHandleResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 3,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_atproto.example.com.', type: 16 }],
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
			await resolver.resolve('example.com');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(DidNotFoundError);
	});

	it('throws on non-atproto dids', async () => {
		const resolver = new DohJsonHandleResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 0,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_atproto.example.com.', type: 16 }],
					Answer: [{ name: '_atproto.example.com.', type: 16, TTL: 300, data: 'did=did:example:123' }],
				});
			},
		});

		let error;
		try {
			await resolver.resolve('example.com');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(InvalidResolvedHandleError);
	});

	it('throws on network error', async () => {
		const resolver = new DohJsonHandleResolver({
			dohUrl: DOH_URL,
			async fetch() {
				throw new TypeError('Network error');
			},
		});

		let error;
		try {
			await resolver.resolve('example.com');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(FailedHandleResolutionError);
		expect((error as Error).cause).toBeInstanceOf(TypeError);
	});

	it('throws on non-ok dns response', async () => {
		const resolver = new DohJsonHandleResolver({
			dohUrl: DOH_URL,
			async fetch() {
				return Response.json({
					Status: 1,
					TC: false,
					RD: true,
					RA: true,
					AD: false,
					CD: false,
					Question: [{ name: '_atproto.example.com.', type: 16 }],
					Answer: [{ name: '_atproto.example.com.', type: 16, TTL: 300, data: 'did=did:example:123' }],
				});
			},
		});

		let error;
		try {
			await resolver.resolve('example.com');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(FailedHandleResolutionError);
		expect((error as Error).cause).toBeInstanceOf(TypeError);
	});
});
