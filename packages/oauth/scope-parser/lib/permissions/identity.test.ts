import { describe, expect, it } from 'vitest';

import { IdentityPermission } from './identity.js';

describe('IdentityPermission', () => {
	describe('fromString', () => {
		it('parses handle attribute', () => {
			const perm = IdentityPermission.fromString('identity:handle');
			expect(perm).not.toBeNull();
			expect(perm!.attr).toBe('handle');
		});

		it('parses wildcard attribute', () => {
			const perm = IdentityPermission.fromString('identity:*');
			expect(perm).not.toBeNull();
			expect(perm!.attr).toBe('*');
		});

		it('returns null for invalid attribute', () => {
			expect(IdentityPermission.fromString('identity:invalid')).toBeNull();
		});

		it('returns null for action parameters', () => {
			expect(IdentityPermission.fromString('identity:*?action=*')).toBeNull();
			expect(IdentityPermission.fromString('identity:*?action=manage')).toBeNull();
			expect(IdentityPermission.fromString('identity:*?action=submit')).toBeNull();
			expect(IdentityPermission.fromString('identity:handle?action=invalid')).toBeNull();
		});

		it('returns null for non-identity scope', () => {
			expect(IdentityPermission.fromString('invalid')).toBeNull();
		});

		it('returns null for invalid format', () => {
			expect(IdentityPermission.fromString('identity?attribute=invalid&action=invalid')).toBeNull();
		});
	});

	describe('matches', () => {
		it('matches exact attribute', () => {
			const perm = IdentityPermission.fromString('identity:handle')!;
			expect(perm.matches({ attr: 'handle' })).toBe(true);
			expect(perm.matches({ attr: '*' })).toBe(false);
		});

		it('wildcard matches all attributes', () => {
			const perm = IdentityPermission.fromString('identity:*')!;
			expect(perm.matches({ attr: '*' })).toBe(true);
			expect(perm.matches({ attr: 'handle' })).toBe(true);
		});
	});

	describe('toString', () => {
		it('formats handle attribute', () => {
			const perm = new IdentityPermission('handle');
			expect(perm.toString()).toBe('identity:handle');
		});

		it('formats wildcard attribute', () => {
			const perm = new IdentityPermission('*');
			expect(perm.toString()).toBe('identity:*');
		});
	});
});
