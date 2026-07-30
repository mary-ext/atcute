import { describe, expect, it, vi } from 'vitest';
import { Keyset } from './keyset.ts';
import type { ClientAssertionPrivateJwk } from '@atcute/oauth-crypto';

// Minimal mock implementation for derivePublicJwk just in case
vi.mock('@atcute/oauth-crypto', () => {
	return {
		derivePublicJwk: vi.fn((k, kid, alg) => ({ ...k, isPublic: true, kid, alg }))
	};
});

describe('Keyset', () => {
	const mockKey = (kid: string, alg: string): ClientAssertionPrivateJwk =>
		({ kid, alg, kty: 'EC', crv: 'P-256', d: 'mock', x: 'mock', y: 'mock' }) as any;

	it('should throw if created with empty keys', () => {
		expect(() => new Keyset([])).toThrow('keyset must contain at least one key');
	});

	it('should throw on duplicate kids', () => {
		expect(() => new Keyset([mockKey('kid1', 'ES256'), mockKey('kid1', 'ES384')])).toThrow(
			'duplicate key ID: kid1'
		);
	});

	it('should return correct size', () => {
		const keyset = new Keyset([mockKey('1', 'ES256'), mockKey('2', 'ES384')]);
		expect(keyset.size).toBe(2);
	});

	it('should sort algorithms according to PREFERRED_ALGORITHMS, and unknown algorithms to the lowest priority (stably)', () => {
		// Array of algorithms we want to test
		const algs = ['XYZ999', 'PS256', 'ES384', 'ABC123', 'ES256', 'RS256'];
		
		// The expected stable sort order:
		// 1. ES256
		// 2. ES384
		// 3. PS256
		// 4. RS256
		// 5. XYZ999 (unknown, keeps relative order)
		// 6. ABC123 (unknown, keeps relative order)
		const expectedOrder = ['ES256', 'ES384', 'PS256', 'RS256', 'XYZ999', 'ABC123'];

		// Test multiple permutations to ensure sort is robust and doesn't rely on coincidental engine behavior
		const permutations = [
			algs,
			// Reverse
			[...algs].reverse(),
			// Some arbitrary shuffles
			['ES256', 'ABC123', 'RS256', 'ES384', 'XYZ999', 'PS256'],
			['XYZ999', 'ABC123', 'RS256', 'PS256', 'ES384', 'ES256'],
		];

		for (const perm of permutations) {
			const keys = perm.map((alg, idx) => mockKey(`kid-${idx}`, alg));
			const keyset = new Keyset(keys);
			
			const ordered = Array.from(keyset.list()).map((k) => k.alg);
			
			// Compute expected order for this specific permutation (since unknown algorithms keep relative order)
			const expectedForPerm = [...perm].sort((a, b) => {
				const PREFERRED_ALGORITHMS = ['ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512', 'RS256', 'RS384', 'RS512'];
				let aIdx = PREFERRED_ALGORITHMS.indexOf(a);
				let bIdx = PREFERRED_ALGORITHMS.indexOf(b);
				if (aIdx === -1) aIdx = PREFERRED_ALGORITHMS.length;
				if (bIdx === -1) bIdx = PREFERRED_ALGORITHMS.length;
				return aIdx - bIdx;
			});

			expect(ordered).toEqual(expectedForPerm);
		}
	});

	it('should filter by kid', () => {
		const keyset = new Keyset([mockKey('1', 'ES256'), mockKey('2', 'ES384')]);
		const found = keyset.find({ kid: '2' });
		expect(found?.kid).toBe('2');
	});

	it('should filter by alg', () => {
		const keyset = new Keyset([mockKey('1', 'ES256'), mockKey('2', 'ES384')]);
		const found = keyset.find({ alg: 'ES384' });
		expect(found?.alg).toBe('ES384');
	});

	it('should filter by array of algs', () => {
		const keyset = new Keyset([mockKey('1', 'RS256'), mockKey('2', 'ES384')]);
		const found = keyset.find({ alg: ['ES256', 'ES384'] });
		expect(found?.alg).toBe('ES384');
	});

	it('get() should throw if not found', () => {
		const keyset = new Keyset([mockKey('1', 'ES256')]);
		expect(() => keyset.get({ kid: '2' })).toThrow('no key found matching: 2');
	});

	it('get() should return if found', () => {
		const keyset = new Keyset([mockKey('1', 'ES256')]);
		expect(keyset.get({ kid: '1' }).kid).toBe('1');
	});

	it('findForSigning() should default to ES256 and return key', () => {
		const keyset = new Keyset([mockKey('1', 'ES384'), mockKey('2', 'ES256')]);
		const result = keyset.findForSigning();
		expect(result.alg).toBe('ES256');
		expect(result.key.kid).toBe('2');
	});

	it('findForSigning() should negotiate correct server alg', () => {
		const keyset = new Keyset([mockKey('1', 'RS256'), mockKey('2', 'ES384')]);
		const result = keyset.findForSigning(['ES384', 'RS256']);
		// Since ES384 is preferred over RS256, it should return ES384
		expect(result.alg).toBe('ES384');
		expect(result.key.kid).toBe('2');
	});
	
	it('findForSigning() should throw if no compatible key', () => {
		const keyset = new Keyset([mockKey('1', 'RS256')]);
		expect(() => keyset.findForSigning(['ES256'])).toThrow('no key found compatible with server algorithms: ES256');
	});
});
