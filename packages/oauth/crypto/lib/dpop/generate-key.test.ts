import { describe, expect, it } from 'vitest';

import { generateDpopKey } from './generate-key.ts';

describe('generateDpopKey', () => {
	it('should generate ES256 key by default', async () => {
		const key = await generateDpopKey();

		expect(key.alg).toBe('ES256');
		expect(key.kty).toBe('EC');
		if (key.kty === 'EC') {
			expect(key.crv).toBe('P-256');
		}
		expect(key.d).toBeDefined();
	});

	it('should prefer ES over PS over RS', async () => {
		const key = await generateDpopKey(['RS256', 'PS256', 'ES384']);

		expect(key.alg).toBe('ES384');
	});

	it('should prefer shorter key lengths within same family', async () => {
		const key = await generateDpopKey(['ES512', 'ES384', 'ES256']);

		expect(key.alg).toBe('ES256');
	});

	it('should throw when no algorithms work', async () => {
		await expect(generateDpopKey(['INVALID_ALG'])).rejects.toThrow('no supported algorithms provided');
	});

	it('should include all required JWK fields', async () => {
		const key = await generateDpopKey();

		expect(key.kty).toBe('EC');
		expect(key.alg).toBeDefined();
		expect(key.d).toBeDefined();
		if (key.kty === 'EC') {
			expect(key.x).toBeDefined();
			expect(key.y).toBeDefined();
		}
	});
});
