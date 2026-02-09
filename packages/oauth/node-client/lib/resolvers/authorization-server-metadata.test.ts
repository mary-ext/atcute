import type { AtprotoAuthorizationServerMetadata } from '@atcute/oauth-types';

import { describe, expect, it, vi } from 'vitest';

import { MemoryStore } from '../utils/memory-store.ts';

import { AuthorizationServerMetadataResolver } from './authorization-server-metadata.ts';

const createValidMetadata = (issuer: string) =>
	({
		issuer,
		authorization_endpoint: `${issuer}/oauth/authorize`,
		token_endpoint: `${issuer}/oauth/token`,
		pushed_authorization_request_endpoint: `${issuer}/oauth/par`,
		dpop_signing_alg_values_supported: ['ES256'],
		scopes_supported: ['atproto'],
		response_types_supported: ['code'],
		grant_types_supported: ['authorization_code', 'refresh_token'],
		code_challenge_methods_supported: ['S256'],
		token_endpoint_auth_methods_supported: ['private_key_jwt'],
		token_endpoint_auth_signing_alg_values_supported: ['ES256'],
		authorization_response_iss_parameter_supported: true,
		require_pushed_authorization_requests: true,
		// atproto required field
		client_id_metadata_document_supported: true,
	}) as AtprotoAuthorizationServerMetadata;

const createMockResponse = (status: number, body: unknown): Response => {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
};

describe('AuthorizationServerMetadataResolver', () => {
	describe('resolve', () => {
		it('should fetch and return valid metadata', async () => {
			const issuer = 'https://auth.example.com';
			const metadata = createValidMetadata(issuer);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			const result = await resolver.resolve(issuer);

			expect(result.issuer).toBe(issuer);
			expect(result.authorization_endpoint).toBe(`${issuer}/oauth/authorize`);
			expect(mockFetch).toHaveBeenCalledTimes(1);

			const request = mockFetch.mock.calls[0][0] as URL;
			expect(request.href).toBe(`${issuer}/.well-known/oauth-authorization-server`);
		});

		it('should cache resolved metadata', async () => {
			const issuer = 'https://auth.example.com';
			const metadata = createValidMetadata(issuer);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			await resolver.resolve(issuer);
			await resolver.resolve(issuer);

			// second call should use cache
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should reject http loopback issuers by default', async () => {
			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				fetch: vi.fn(),
			});

			// http is only allowed for loopback addresses, but allowHttp must be true
			await expect(resolver.resolve('http://localhost:3000')).rejects.toThrow('http issuer not allowed');
		});

		it('should allow http issuers when allowHttp is true', async () => {
			const issuer = 'http://localhost:3000';
			const metadata = createValidMetadata(issuer);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				allowHttp: true,
				fetch: mockFetch,
			});

			const result = await resolver.resolve(issuer);
			expect(result.issuer).toBe(issuer);
		});
	});

	describe('error handling', () => {
		it('should throw on non-200 response', async () => {
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(404, { error: 'not found' }));

			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			let error: Error | undefined;
			try {
				await resolver.resolve('https://auth.example.com');
			} catch (e) {
				error = e as Error;
			}

			expect(error).toBeDefined();
			expect(error!.message).toContain('unexpected status 404');
		});

		it('should throw on issuer mismatch', async () => {
			const issuer = 'https://auth.example.com';
			const metadata = createValidMetadata('https://other.example.com'); // wrong issuer
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			let error: Error | undefined;
			try {
				await resolver.resolve(issuer);
			} catch (e) {
				error = e as Error;
			}

			expect(error).toBeDefined();
			expect(error!.message).toContain('issuer mismatch');
		});

		it('should throw on invalid issuer format', async () => {
			const resolver = new AuthorizationServerMetadataResolver({
				cache: new MemoryStore({}),
				fetch: vi.fn(),
			});

			await expect(resolver.resolve('not-a-url')).rejects.toThrow();
		});
	});
});
