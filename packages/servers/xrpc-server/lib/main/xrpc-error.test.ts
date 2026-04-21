import { describe, expect, it } from 'vitest';

import { AuthRequiredError, formatWWWAuthenticate } from './xrpc-error.ts';

describe('formatWWWAuthenticate', () => {
	it('formats a bare scheme', () => {
		expect(formatWWWAuthenticate({ scheme: 'Bearer' })).toBe('Bearer');
	});

	it('formats a scheme with params', () => {
		expect(
			formatWWWAuthenticate({
				scheme: 'Bearer',
				params: { realm: 'api.example.com', error: 'BadJwtSignature' },
			}),
		).toBe('Bearer realm="api.example.com", error="BadJwtSignature"');
	});

	it('skips params whose value is undefined', () => {
		expect(
			formatWWWAuthenticate({
				scheme: 'Bearer',
				params: { realm: 'api', error: undefined },
			}),
		).toBe('Bearer realm="api"');
	});

	it('emits token68 instead of params when provided', () => {
		expect(formatWWWAuthenticate({ scheme: 'Basic', token68: 'abc==' })).toBe('Basic abc==');
	});

	it('joins multiple challenges with commas', () => {
		expect(
			formatWWWAuthenticate([
				{ scheme: 'Bearer', params: { error: 'BadJwt' } },
				{ scheme: 'DPoP', params: { error: 'use_dpop_nonce' } },
			]),
		).toBe('Bearer error="BadJwt", DPoP error="use_dpop_nonce"');
	});
});

describe('AuthRequiredError', () => {
	it('sets WWW-Authenticate header from wwwAuthenticate option', () => {
		const err = new AuthRequiredError({
			message: 'invalid token',
			wwwAuthenticate: { scheme: 'Bearer', params: { error: 'BadJwtSignature' } },
		});

		const response = err.toResponse();
		expect(response.headers.get('www-authenticate')).toBe('Bearer error="BadJwtSignature"');
		expect(response.headers.get('access-control-expose-headers')).toBe('www-authenticate');
	});

	it('merges with caller-provided headers', () => {
		const err = new AuthRequiredError({
			message: 'invalid token',
			headers: { 'x-custom': 'value' },
			wwwAuthenticate: { scheme: 'Bearer' },
		});

		const response = err.toResponse();
		expect(response.headers.get('x-custom')).toBe('value');
		expect(response.headers.get('www-authenticate')).toBe('Bearer');
	});

	it('does nothing special when wwwAuthenticate is absent', () => {
		const err = new AuthRequiredError({ message: 'unauthorized' });

		const response = err.toResponse();
		expect(response.headers.has('www-authenticate')).toBe(false);
	});
});
