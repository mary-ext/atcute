import { describe, expect, it } from 'vitest';

import { BlobPermission } from './blob.js';

describe('BlobPermission', () => {
	describe('fromString', () => {
		it('parses single accept', () => {
			const perm = BlobPermission.fromString('blob:image/png');
			expect(perm).not.toBeNull();
			expect(perm!.accept).toEqual(['image/png']);
		});

		it('parses multiple accept via query params', () => {
			const perm = BlobPermission.fromString('blob?accept=image/png&accept=image/jpeg');
			expect(perm).not.toBeNull();
			expect(perm!.accept).toContain('image/png');
			expect(perm!.accept).toContain('image/jpeg');
		});

		it('parses full wildcard', () => {
			const perm = BlobPermission.fromString('blob:*/*');
			expect(perm).not.toBeNull();
			expect(perm!.accept).toEqual(['*/*']);
		});

		it('parses subtype wildcard', () => {
			const perm = BlobPermission.fromString('blob:image/*');
			expect(perm).not.toBeNull();
			expect(perm!.accept).toEqual(['image/*']);
		});

		it('returns null for missing accept', () => {
			expect(BlobPermission.fromString('blob')).toBeNull();
		});

		it('returns null for invalid MIME', () => {
			expect(BlobPermission.fromString('blob:invalid')).toBeNull();
			expect(BlobPermission.fromString('blob?accept=invalid-mime')).toBeNull();
			expect(BlobPermission.fromString('blob?accept=invalid')).toBeNull();
			expect(BlobPermission.fromString('blob:*/**')).toBeNull();
			expect(BlobPermission.fromString('blob:*/png')).toBeNull();
		});

		it('returns null for non-blob scope', () => {
			expect(BlobPermission.fromString('invalid')).toBeNull();
			expect(BlobPermission.fromString('scope')).toBeNull();
		});
	});

	describe('matches', () => {
		it('matches exact MIME', () => {
			const perm = BlobPermission.fromString('blob:image/png')!;
			expect(perm.matches({ mime: 'image/png' })).toBe(true);
			expect(perm.matches({ mime: 'image/jpeg' })).toBe(false);
		});

		it('matches full wildcard', () => {
			const perm = BlobPermission.fromString('blob:*/*')!;
			expect(perm.matches({ mime: 'image/jpeg' })).toBe(true);
			expect(perm.matches({ mime: 'application/json' })).toBe(true);
		});

		it('matches subtype wildcard', () => {
			const perm = BlobPermission.fromString('blob:image/*')!;
			expect(perm.matches({ mime: 'image/png' })).toBe(true);
			expect(perm.matches({ mime: 'image/gif' })).toBe(true);
			expect(perm.matches({ mime: 'application/json' })).toBe(false);
		});

		it('matches multiple accept values', () => {
			const perm = BlobPermission.fromString('blob?accept=image/png&accept=image/jpeg')!;
			expect(perm.matches({ mime: 'image/png' })).toBe(true);
			expect(perm.matches({ mime: 'image/jpeg' })).toBe(true);
			expect(perm.matches({ mime: 'image/gif' })).toBe(false);
		});
	});

	describe('toString', () => {
		it('uses positional for single accept', () => {
			const perm = new BlobPermission(['image/png']);
			expect(perm.toString()).toBe('blob:image/png');
		});

		it('uses query params for multiple accept', () => {
			const perm = new BlobPermission(['image/png', 'image/jpeg']);
			expect(perm.toString()).toBe('blob?accept=image/jpeg&accept=image/png');
		});

		it('normalizes to lowercase', () => {
			const perm = new BlobPermission(['IMAGE/PNG']);
			expect(perm.toString()).toBe('blob:image/png');
		});

		it('removes redundant types', () => {
			expect(new BlobPermission(['*/*', 'image/*']).toString()).toBe('blob:*/*');
			expect(new BlobPermission(['*/*', 'image/png']).toString()).toBe('blob:*/*');
			expect(new BlobPermission(['image/*', 'image/png']).toString()).toBe('blob:image/*');
		});

		it('sorts multiple accept values', () => {
			const perm = new BlobPermission(['image/png', 'image/jpeg']);
			expect(perm.toString()).toBe('blob?accept=image/jpeg&accept=image/png');
		});
	});

	describe('normalization consistency', () => {
		const cases = [
			['blob:image/png', 'blob:image/png'],
			['blob:image/*', 'blob:image/*'],
			['blob:*/*', 'blob:*/*'],
			['blob?accept=image/png&accept=image/jpeg', 'blob?accept=image/jpeg&accept=image/png'],
		];

		for (const [input, expected] of cases) {
			it(`normalizes '${input}' to '${expected}'`, () => {
				const perm = BlobPermission.fromString(input);
				expect(perm).not.toBeNull();
				expect(perm!.toString()).toBe(expected);
			});
		}
	});
});
