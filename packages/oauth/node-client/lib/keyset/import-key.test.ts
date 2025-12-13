import { describe, expect, it } from 'vitest';

import {
	exportJwkKey,
	exportPkcs8Key,
	generatePrivateKey,
	importJwkKey,
	importPkcs8Key,
} from './import-key.js';

describe('generatePrivateKey', () => {
	it('should generate ES256 key by default', async () => {
		const key = await generatePrivateKey('test-key');

		expect(key.kid).toBe('test-key');
		expect(key.alg).toBe('ES256');
		expect(key.key).toBeInstanceOf(CryptoKey);
		expect(key.publicJwk.kty).toBe('EC');
		expect(key.publicJwk.crv).toBe('P-256');
	});

	it('should generate key with specified algorithm', async () => {
		const key = await generatePrivateKey('test-key', 'ES384');

		expect(key.alg).toBe('ES384');
		expect(key.publicJwk.crv).toBe('P-384');
	});

	it('should not include private material in publicJwk', async () => {
		const key = await generatePrivateKey('test-key');

		expect((key.publicJwk as Record<string, unknown>).d).toBeUndefined();
		expect(key.publicJwk.x).toBeDefined();
		expect(key.publicJwk.y).toBeDefined();
	});
});

describe('importJwkKey', () => {
	it('should import JWK object', async () => {
		const original = await generatePrivateKey('test-key', 'ES256');
		const jwk = await exportJwkKey(original);

		const imported = await importJwkKey(jwk);

		expect(imported.kid).toBe('test-key');
		expect(imported.alg).toBe('ES256');
	});

	it('should import JSON string', async () => {
		const original = await generatePrivateKey('test-key');
		const jwk = await exportJwkKey(original);
		const jsonStr = JSON.stringify(jwk);

		const imported = await importJwkKey(jsonStr);

		expect(imported.kid).toBe('test-key');
	});

	it('should allow overriding kid via options', async () => {
		const original = await generatePrivateKey('original-kid');
		const jwk = await exportJwkKey(original);

		const imported = await importJwkKey(jwk, { kid: 'new-kid' });

		expect(imported.kid).toBe('new-kid');
	});

	it('should allow overriding alg via options', async () => {
		const original = await generatePrivateKey('test-key', 'ES256');
		const jwk = await exportJwkKey(original);

		// ES256 key can also work with ES256 alg override (same key)
		const imported = await importJwkKey(jwk, { alg: 'ES256' });

		expect(imported.alg).toBe('ES256');
	});

	it('should infer algorithm from EC curve', async () => {
		const original = await generatePrivateKey('test-key', 'ES384');
		const jwk = await exportJwkKey(original);
		delete jwk.alg; // remove alg to test inference

		const imported = await importJwkKey(jwk);

		expect(imported.alg).toBe('ES384');
	});

	it('should throw on missing kid', async () => {
		const original = await generatePrivateKey('test-key');
		const jwk = await exportJwkKey(original);
		delete jwk.kid;

		await expect(importJwkKey(jwk)).rejects.toThrow('kid is required');
	});

	it('should throw on missing alg for RSA key', async () => {
		const original = await generatePrivateKey('test-key', 'RS256');
		const jwk = await exportJwkKey(original);
		delete jwk.alg;

		await expect(importJwkKey(jwk)).rejects.toThrow('alg is required');
	});

	it('should throw on invalid JSON string', async () => {
		await expect(importJwkKey('not valid json')).rejects.toThrow('invalid JSON string');
	});

	it('should throw on non-private key', async () => {
		const original = await generatePrivateKey('test-key');
		const publicJwk = { ...original.publicJwk };

		await expect(importJwkKey(publicJwk)).rejects.toThrow("expected a private key (missing 'd' parameter)");
	});

	it('should throw on unsupported algorithm', async () => {
		const original = await generatePrivateKey('test-key');
		const jwk = await exportJwkKey(original);

		await expect(importJwkKey(jwk, { alg: 'HS256' as any })).rejects.toThrow('unsupported algorithm');
	});
});

describe('importPkcs8Key', () => {
	it('should import PKCS#8 PEM', async () => {
		const original = await generatePrivateKey('test-key', 'ES256');
		const pem = await exportPkcs8Key(original);

		const imported = await importPkcs8Key(pem, { kid: 'imported-key', alg: 'ES256' });

		expect(imported.kid).toBe('imported-key');
		expect(imported.alg).toBe('ES256');
		expect(imported.key).toBeInstanceOf(CryptoKey);
	});

	it('should throw on unsupported algorithm', async () => {
		const original = await generatePrivateKey('test-key', 'ES256');
		const pem = await exportPkcs8Key(original);

		await expect(importPkcs8Key(pem, { kid: 'key', alg: 'HS256' as any })).rejects.toThrow(
			'unsupported algorithm',
		);
	});
});

describe('round-trip exports', () => {
	it('should round-trip through JWK', async () => {
		const original = await generatePrivateKey('test-key', 'ES256');
		const jwk = await exportJwkKey(original);
		const imported = await importJwkKey(jwk);

		expect(imported.kid).toBe(original.kid);
		expect(imported.alg).toBe(original.alg);
		expect(imported.publicJwk).toEqual(original.publicJwk);
	});

	it('should round-trip through PKCS#8', async () => {
		const original = await generatePrivateKey('test-key', 'ES256');
		const pem = await exportPkcs8Key(original);
		const imported = await importPkcs8Key(pem, { kid: 'test-key', alg: 'ES256' });

		expect(imported.kid).toBe(original.kid);
		expect(imported.alg).toBe(original.alg);
		// public key should match
		expect(imported.publicJwk.x).toBe(original.publicJwk.x);
		expect(imported.publicJwk.y).toBe(original.publicJwk.y);
	});

	it('should work with different EC algorithms', async () => {
		for (const alg of ['ES256', 'ES384', 'ES512'] as const) {
			const original = await generatePrivateKey(`key-${alg}`, alg);
			const jwk = await exportJwkKey(original);
			const imported = await importJwkKey(jwk);

			expect(imported.alg).toBe(alg);
		}
	});

	it('should work with RSA algorithms', async () => {
		for (const alg of ['RS256', 'PS256'] as const) {
			const original = await generatePrivateKey(`key-${alg}`, alg);
			const jwk = await exportJwkKey(original);
			const imported = await importJwkKey(jwk);

			expect(imported.alg).toBe(alg);
			expect(imported.publicJwk.kty).toBe('RSA');
		}
	});
});

describe('exportJwkKey', () => {
	it('should include kid and alg', async () => {
		const key = await generatePrivateKey('my-key', 'ES384');
		const jwk = await exportJwkKey(key);

		expect(jwk.kid).toBe('my-key');
		expect(jwk.alg).toBe('ES384');
	});

	it('should include private key material', async () => {
		const key = await generatePrivateKey('my-key');
		const jwk = await exportJwkKey(key);

		expect(jwk.d).toBeDefined(); // private key component
	});
});

describe('exportPkcs8Key', () => {
	it('should return valid PEM format', async () => {
		const key = await generatePrivateKey('my-key');
		const pem = await exportPkcs8Key(key);

		expect(pem).toContain('-----BEGIN PRIVATE KEY-----');
		expect(pem).toContain('-----END PRIVATE KEY-----');
	});
});
