import { describe, expect, it } from 'vitest';

import { generatePrivateKey } from './import-key.js';
import { Keyset } from './keyset.js';

describe('Keyset', () => {
	describe('constructor', () => {
		it('should create keyset with valid keys', async () => {
			const key = await generatePrivateKey('key-1');
			const keyset = new Keyset([key]);

			expect(keyset.size).toBe(1);
		});

		it('should reject empty keyset', () => {
			expect(() => new Keyset([])).toThrow('keyset must contain at least one key');
		});

		it('should reject duplicate key IDs', async () => {
			const key1 = await generatePrivateKey('same-id');
			const key2 = await generatePrivateKey('same-id');

			expect(() => new Keyset([key1, key2])).toThrow('duplicate key ID: same-id');
		});

		it('should accept multiple keys with different IDs', async () => {
			const key1 = await generatePrivateKey('key-1');
			const key2 = await generatePrivateKey('key-2', 'ES384');

			const keyset = new Keyset([key1, key2]);
			expect(keyset.size).toBe(2);
		});
	});

	describe('find', () => {
		it('should find key by kid', async () => {
			const key1 = await generatePrivateKey('key-1');
			const key2 = await generatePrivateKey('key-2');
			const keyset = new Keyset([key1, key2]);

			const found = keyset.find({ kid: 'key-2' });
			expect(found?.kid).toBe('key-2');
		});

		it('should find key by alg', async () => {
			const key1 = await generatePrivateKey('key-1', 'ES256');
			const key2 = await generatePrivateKey('key-2', 'ES384');
			const keyset = new Keyset([key1, key2]);

			const found = keyset.find({ alg: 'ES384' });
			expect(found?.kid).toBe('key-2');
		});

		it('should find key by alg array', async () => {
			const key1 = await generatePrivateKey('key-1', 'ES256');
			const key2 = await generatePrivateKey('key-2', 'ES384');
			const keyset = new Keyset([key1, key2]);

			const found = keyset.find({ alg: ['ES384', 'ES512'] });
			expect(found?.kid).toBe('key-2');
		});

		it('should return undefined when not found', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);

			expect(keyset.find({ kid: 'nonexistent' })).toBeUndefined();
			expect(keyset.find({ alg: 'RS256' })).toBeUndefined();
		});

		it('should return first key when no options provided', async () => {
			const key1 = await generatePrivateKey('key-1', 'ES256');
			const key2 = await generatePrivateKey('key-2', 'ES384');
			const keyset = new Keyset([key1, key2]);

			// should return based on algorithm preference order
			const found = keyset.find();
			expect(found).toBeDefined();
		});
	});

	describe('get', () => {
		it('should get key by kid', async () => {
			const key = await generatePrivateKey('key-1');
			const keyset = new Keyset([key]);

			const found = keyset.get({ kid: 'key-1' });
			expect(found.kid).toBe('key-1');
		});

		it('should throw when key not found', async () => {
			const key = await generatePrivateKey('key-1');
			const keyset = new Keyset([key]);

			expect(() => keyset.get({ kid: 'nonexistent' })).toThrow('no key found matching: nonexistent');
			expect(() => keyset.get({ alg: 'RS512' })).toThrow('no key found matching: RS512');
		});
	});

	describe('list', () => {
		it('should list all keys when no options', async () => {
			const key1 = await generatePrivateKey('key-1');
			const key2 = await generatePrivateKey('key-2');
			const keyset = new Keyset([key1, key2]);

			const keys = [...keyset.list()];
			expect(keys).toHaveLength(2);
		});

		it('should filter by alg', async () => {
			const key1 = await generatePrivateKey('key-1', 'ES256');
			const key2 = await generatePrivateKey('key-2', 'ES384');
			const key3 = await generatePrivateKey('key-3', 'ES256');
			const keyset = new Keyset([key1, key2, key3]);

			const keys = [...keyset.list({ alg: 'ES256' })];
			expect(keys).toHaveLength(2);
			expect(keys.map((k) => k.kid)).toEqual(['key-1', 'key-3']);
		});

		it('should sort by algorithm preference', async () => {
			const rsKey = await generatePrivateKey('rs-key', 'RS256');
			const esKey = await generatePrivateKey('es-key', 'ES256');
			const keyset = new Keyset([rsKey, esKey]);

			// ES256 should come before RS256 in preference order
			const keys = [...keyset.list()];
			expect(keys[0].alg).toBe('ES256');
			expect(keys[1].alg).toBe('RS256');
		});
	});

	describe('findForSigning', () => {
		it('should find compatible key for server algs', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);

			const result = keyset.findForSigning(['ES256', 'ES384']);
			expect(result.key.kid).toBe('key-1');
			expect(result.alg).toBe('ES256');
		});

		it('should default to ES256 when no server algs provided', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);

			const result = keyset.findForSigning();
			expect(result.alg).toBe('ES256');
		});

		it('should throw when no compatible key', async () => {
			const key = await generatePrivateKey('key-1', 'ES384');
			const keyset = new Keyset([key]);

			expect(() => keyset.findForSigning(['RS256', 'RS512'])).toThrow(
				'no key found compatible with server algorithms',
			);
		});
	});

	describe('publicJwks', () => {
		it('should return public keys only', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);

			const jwks = keyset.publicJwks;
			expect(jwks.keys).toHaveLength(1);
			expect(jwks.keys[0].kid).toBe('key-1');
			expect(jwks.keys[0].kty).toBe('EC');
			// should not have private key material
			expect((jwks.keys[0] as Record<string, unknown>).d).toBeUndefined();
		});
	});

	describe('iteration', () => {
		it('should be iterable', async () => {
			const key1 = await generatePrivateKey('key-1');
			const key2 = await generatePrivateKey('key-2');
			const keyset = new Keyset([key1, key2]);

			const keys = [...keyset];
			expect(keys).toHaveLength(2);
		});
	});
});
