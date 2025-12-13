import { describe, expect, it } from 'vitest';

import { generatePkce } from './pkce.js';

describe('generatePkce', () => {
	it('should generate verifier of correct length', async () => {
		const pkce = await generatePkce();

		// RFC 7636 requires 43-128 characters
		expect(pkce.verifier.length).toBe(44);
	});

	it('should generate base64url challenge', async () => {
		const pkce = await generatePkce();

		// base64url uses only these characters
		expect(pkce.challenge).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	it('should use S256 method', async () => {
		const pkce = await generatePkce();

		expect(pkce.method).toBe('S256');
	});

	it('should generate unique values', async () => {
		const pkce1 = await generatePkce();
		const pkce2 = await generatePkce();

		expect(pkce1.verifier).not.toBe(pkce2.verifier);
		expect(pkce1.challenge).not.toBe(pkce2.challenge);
	});

	it('should generate verifier with valid characters', async () => {
		const pkce = await generatePkce();

		// nanoid uses URL-safe characters
		expect(pkce.verifier).toMatch(/^[A-Za-z0-9_-]+$/);
	});
});
