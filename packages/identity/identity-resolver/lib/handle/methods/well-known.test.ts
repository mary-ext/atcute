import { describe, expect, it } from 'vitest';

import { DidNotFoundError, FailedHandleResolutionError, InvalidResolvedHandleError } from '../../errors.js';
import { WellKnownHandleResolver } from './well-known.js';

describe('WellKnownHandleResolver', () => {
	it('resolves handle correctly', async () => {
		const resolver = new WellKnownHandleResolver({
			async fetch(input, init) {
				const request = new Request(input, init);
				const url = new URL(request.url);

				expect(url.protocol).toBe('https:');
				expect(url.host).toBe('example.com');
				expect(url.pathname).toBe('/.well-known/atproto-did');

				return new Response(`did:plc:ia76kvnndjutgedggx2ibrem`);
			},
		});

		const did = await resolver.resolve('example.com');
		expect(did).toBe('did:plc:ia76kvnndjutgedggx2ibrem');
	});

	it('handles whitespace in response', async () => {
		const resolver = new WellKnownHandleResolver({
			async fetch(_input, _init) {
				return new Response(`   did:plc:ia76kvnndjutgedggx2ibrem  \n\n`);
			},
		});

		const did = await resolver.resolve('example.com');
		expect(did).toBe('did:plc:ia76kvnndjutgedggx2ibrem');
	});

	it('throws on 404 response', async () => {
		const resolver = new WellKnownHandleResolver({
			async fetch(_input, _init) {
				return new Response(null, { status: 404 });
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

	it('throws on network error', async () => {
		const resolver = new WellKnownHandleResolver({
			async fetch(_input, _init) {
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

	it('throws on non-atproto DID', async () => {
		const resolver = new WellKnownHandleResolver({
			async fetch(_input, _init) {
				return new Response(`did:example:123`);
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

	it('throws on invalid content', async () => {
		const resolver = new WellKnownHandleResolver({
			async fetch(_input, _init) {
				return new Response(`not-a-did`);
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
});
