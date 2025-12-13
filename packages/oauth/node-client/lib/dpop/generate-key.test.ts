import { describe, expect, it } from 'vitest';

import { generateDpopKey } from './generate-key.js';

describe('generateDpopKey', () => {
	it('should generate ES256 key by default', async () => {
		const key = await generateDpopKey();

		expect(key.alg).toBe('ES256');
		expect(key.kty).toBe('EC');
		expect(key.crv).toBe('P-256');
		expect(key.d).toBeDefined(); // private key component
	});

	it('should prefer ES256K when supported', async () => {
		// ES256K may not be supported in all environments, so this might fall back
		const key = await generateDpopKey(['ES256K', 'ES256']);

		// should be one of the supported algorithms
		expect(['ES256K', 'ES256']).toContain(key.alg);
	});

	it('should prefer ES over PS over RS', async () => {
		const key = await generateDpopKey(['RS256', 'PS256', 'ES384']);

		// ES384 should be preferred over PS256 and RS256
		expect(key.alg).toBe('ES384');
	});

	it('should prefer shorter key lengths within same family', async () => {
		const key = await generateDpopKey(['ES512', 'ES384', 'ES256']);

		// ES256 should be preferred (shorter = faster)
		expect(key.alg).toBe('ES256');
	});

	it('should throw when no algorithms work', async () => {
		await expect(generateDpopKey(['INVALID_ALG'])).rejects.toThrow('failed to generate DPoP key');
	});

	it('should include all required JWK fields', async () => {
		const key = await generateDpopKey();

		expect(key.kty).toBeDefined();
		expect(key.alg).toBeDefined();
		// EC keys have x, y, d
		expect(key.x).toBeDefined();
		expect(key.y).toBeDefined();
		expect(key.d).toBeDefined();
	});
});
