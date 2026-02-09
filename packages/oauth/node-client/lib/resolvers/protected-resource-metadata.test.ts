import type { AtprotoProtectedResourceMetadata } from '@atcute/oauth-types';

import { describe, expect, it, vi } from 'vitest';

import { MemoryStore } from '../utils/memory-store.ts';

import { ProtectedResourceMetadataResolver } from './protected-resource-metadata.ts';

const createValidMetadata = (resource: string) =>
	({
		resource,
		authorization_servers: ['https://auth.example.com'],
		scopes_supported: ['atproto'],
		bearer_methods_supported: ['header'],
	}) as AtprotoProtectedResourceMetadata;

const createMockResponse = (status: number, body: unknown): Response => {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
};

describe('ProtectedResourceMetadataResolver', () => {
	describe('resolve', () => {
		it('should fetch and return valid metadata', async () => {
			const resource = 'https://pds.example.com';
			const metadata = createValidMetadata(resource);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			const result = await resolver.resolve(resource);

			expect(result.resource).toBe(resource);
			expect(result.authorization_servers).toContain('https://auth.example.com');
			expect(mockFetch).toHaveBeenCalledTimes(1);

			const request = mockFetch.mock.calls[0][0] as URL;
			expect(request.href).toBe(`${resource}/.well-known/oauth-protected-resource`);
		});

		it('should cache resolved metadata', async () => {
			const resource = 'https://pds.example.com';
			const metadata = createValidMetadata(resource);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			await resolver.resolve(resource);
			await resolver.resolve(resource);

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should strip path from resource URL', async () => {
			const resource = 'https://pds.example.com';
			const metadata = createValidMetadata(resource);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			const result = await resolver.resolve('https://pds.example.com/xrpc/something');

			expect(result.resource).toBe(resource);
		});

		it('should reject http resources by default', async () => {
			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: vi.fn(),
			});

			await expect(resolver.resolve('http://localhost:3000')).rejects.toThrow('http resource not allowed');
		});

		it('should allow http resources when allowHttp is true', async () => {
			const resource = 'http://localhost:3000';
			const metadata = createValidMetadata(resource);
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				allowHttp: true,
				fetch: mockFetch,
			});

			const result = await resolver.resolve(resource);
			expect(result.resource).toBe(resource);
		});
	});

	describe('error handling', () => {
		it('should throw on non-200 response', async () => {
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(404, { error: 'not found' }));

			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			await expect(resolver.resolve('https://pds.example.com')).rejects.toThrow('unexpected status 404');
		});

		it('should throw on resource mismatch', async () => {
			const metadata = createValidMetadata('https://other-pds.example.com');
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200, metadata));

			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: mockFetch,
			});

			await expect(resolver.resolve('https://pds.example.com')).rejects.toThrow('resource mismatch');
		});

		it('should throw on invalid protocol', async () => {
			const resolver = new ProtectedResourceMetadataResolver({
				cache: new MemoryStore({}),
				fetch: vi.fn(),
			});

			await expect(resolver.resolve('ftp://pds.example.com')).rejects.toThrow('invalid resource protocol');
		});
	});
});
