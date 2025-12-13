import { describe, expect, it } from 'vitest';

import { generatePrivateKey } from './keyset/import-key.js';
import { Keyset } from './keyset/keyset.js';
import type { ConfidentialClientMetadata } from './schemas/atcute-confidential-client-metadata.js';

import { buildClientMetadata } from './build-client-metadata.js';

const createValidMetadata = (): ConfidentialClientMetadata => ({
	client_id: 'https://example.com/client-metadata.json',
	client_name: 'Test Client',
	client_uri: 'https://example.com',
	redirect_uris: ['https://example.com/callback'],
	scope: 'atproto',
});

describe('buildClientMetadata', () => {
	describe('valid metadata', () => {
		it('accepts valid metadata with ES256 key', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);
			const metadata = createValidMetadata();

			const result = buildClientMetadata(metadata, keyset);

			expect(result.client_id).toBe('https://example.com/client-metadata.json');
			expect(result.token_endpoint_auth_method).toBe('private_key_jwt');
			expect(result.dpop_bound_access_tokens).toBe(true);
		});

		it('populates jwks from keyset if jwks_uri is not provided', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);
			const metadata = createValidMetadata();

			const result = buildClientMetadata(metadata, keyset);

			expect(result.jwks).toBeDefined();
			expect(result.jwks!.keys).toHaveLength(1);
			expect(result.jwks!.keys[0].kid).toBe('key-1');
		});

		it('uses jwks_uri when provided', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);
			const metadata: ConfidentialClientMetadata = {
				...createValidMetadata(),
				jwks_uri: 'https://example.com/.well-known/jwks.json',
			};

			const result = buildClientMetadata(metadata, keyset);
			expect(result.jwks_uri).toBe('https://example.com/.well-known/jwks.json');
			expect(result.jwks).toBeUndefined();
		});

		it('supports multiple keys (including ES256)', async () => {
			const key1 = await generatePrivateKey('key-1', 'ES256');
			const key2 = await generatePrivateKey('key-2', 'ES384');
			const keyset = new Keyset([key1, key2]);
			const metadata = createValidMetadata();

			const result = buildClientMetadata(metadata, keyset);

			expect(result.jwks!.keys).toHaveLength(2);
		});
	});

	describe('invalid metadata', () => {
		it('rejects keyset without ES256 key', async () => {
			const key = await generatePrivateKey('key-1', 'ES384');
			const keyset = new Keyset([key]);
			const metadata = createValidMetadata();

			expect(() => buildClientMetadata(metadata, keyset)).toThrow(
				'"private_key_jwt" requires at least one "ES256" signing key',
			);
		});

		it('rejects loopback client_id', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);
			const metadata: ConfidentialClientMetadata = {
				...createValidMetadata(),
				client_id: 'http://127.0.0.1:8080/callback',
			};

			expect(() => buildClientMetadata(metadata, keyset)).toThrow();
		});

		it('rejects missing atproto scope', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);
			const metadata: ConfidentialClientMetadata = {
				...createValidMetadata(),
				scope: 'openid profile',
			};

			expect(() => buildClientMetadata(metadata, keyset)).toThrow();
		});

		it('rejects jwks_uri with different origin', async () => {
			const key = await generatePrivateKey('key-1', 'ES256');
			const keyset = new Keyset([key]);
			const metadata: ConfidentialClientMetadata = {
				...createValidMetadata(),
				jwks_uri: 'https://other.example.com/.well-known/jwks.json',
			};

			expect(() => buildClientMetadata(metadata, keyset)).not.toThrow();
		});
	});
});
