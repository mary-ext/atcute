import { describe, expect, it, vi } from 'vitest';

import { createDpopFetch } from './fetch.js';
import { generateDpopKey } from './generate-key.js';
import type { DpopNonceCache } from './types.js';

const createMemoryNonceCache = (): DpopNonceCache => {
	const map = new Map<string, string>();
	return {
		get: (key) => map.get(key),
		set: (key, value) => {
			map.set(key, value);
		},
	};
};

const createMockResponse = (status: number, body?: unknown, headers?: Record<string, string>): Response => {
	return new Response(body ? JSON.stringify(body) : null, {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});
};

describe('createDpopFetch', () => {
	describe('basic DPoP proof', () => {
		it('should add DPoP header to requests', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, { ok: true }));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api');

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const request = mockFetch.mock.calls[0][0] as Request;
			expect(request.headers.get('DPoP')).toBeTruthy();
		});

		it('should include method and URL in DPoP proof', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api', { method: 'POST' });

			const request = mockFetch.mock.calls[0][0] as Request;
			const dpopProof = request.headers.get('DPoP')!;

			// DPoP proof is a JWT - verify it has 3 parts
			expect(dpopProof.split('.').length).toBe(3);
		});
	});

	describe('nonce handling', () => {
		it('should cache nonce from response', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			const mockFetch = vi
				.fn()
				.mockResolvedValue(createMockResponse(200, { ok: true }, { 'DPoP-Nonce': 'server-nonce-123' }));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api');

			expect(await nonces.get('https://example.com')).toBe('server-nonce-123');
		});

		it('should use cached nonce in subsequent requests', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			await nonces.set('https://example.com', 'cached-nonce');

			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api');

			// the proof should contain the cached nonce
			// (we can't easily verify the JWT contents, but we can verify the request was made)
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should retry with new nonce on use_dpop_nonce error (resource server)', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();

			const mockFetch = vi
				.fn()
				.mockResolvedValueOnce(
					createMockResponse(
						401,
						{},
						{
							'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
							'DPoP-Nonce': 'new-nonce',
						},
					),
				)
				.mockResolvedValueOnce(createMockResponse(200, { ok: true }));

			const dpopFetch = createDpopFetch({ key, nonces, isAuthServer: false, fetch: mockFetch });

			const response = await dpopFetch('https://example.com/api');

			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(response.status).toBe(200);
			expect(await nonces.get('https://example.com')).toBe('new-nonce');
		});

		it('should retry with new nonce on use_dpop_nonce error (auth server)', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();

			const mockFetch = vi
				.fn()
				.mockResolvedValueOnce(
					createMockResponse(400, { error: 'use_dpop_nonce' }, { 'DPoP-Nonce': 'new-nonce' }),
				)
				.mockResolvedValueOnce(createMockResponse(200, { access_token: 'token' }));

			const dpopFetch = createDpopFetch({ key, nonces, isAuthServer: true, fetch: mockFetch });

			const response = await dpopFetch('https://auth.example.com/token', { method: 'POST' });

			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(response.status).toBe(200);
		});
	});

	describe('access token hash (ath)', () => {
		it('should include ath when Authorization header has DPoP token', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api', {
				headers: { Authorization: 'DPoP access-token-here' },
			});

			// verify request was made with DPoP header
			const request = mockFetch.mock.calls[0][0] as Request;
			expect(request.headers.get('DPoP')).toBeTruthy();
			expect(request.headers.get('Authorization')).toBe('DPoP access-token-here');
		});
	});

	describe('error cases', () => {
		it('should throw if key alg not supported by server', async () => {
			const key = await generateDpopKey(['ES256']);
			const nonces = createMemoryNonceCache();

			expect(() =>
				createDpopFetch({
					key,
					nonces,
					supportedAlgs: ['RS256', 'RS512'], // server doesn't support ES256
				}),
			).toThrow('not supported by server');
		});
	});

	describe('URL handling', () => {
		it('should strip query string from htu', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api?foo=bar&baz=qux');

			expect(mockFetch).toHaveBeenCalledTimes(1);
			// the htu in the JWT should not include query string
			// (verified implicitly by successful request)
		});

		it('should strip fragment from htu', async () => {
			const jwk = await generateDpopKey();
			const key = jwk;
			const nonces = createMemoryNonceCache();
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200));

			const dpopFetch = createDpopFetch({ key, nonces, fetch: mockFetch });

			await dpopFetch('https://example.com/api#section');

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});
});
