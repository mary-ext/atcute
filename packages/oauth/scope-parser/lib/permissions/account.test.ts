import { describe, expect, it } from 'vitest';

import { AccountPermission } from './account.js';

describe('AccountPermission', () => {
	describe('fromString', () => {
		it('parses with attr only (default action)', () => {
			const perm = AccountPermission.fromString('account:email');
			expect(perm).not.toBeNull();
			expect(perm!.attr).toBe('email');
			expect(perm!.action).toEqual(['read']);
		});

		it('parses with explicit read action', () => {
			const perm = AccountPermission.fromString('account:email?action=read');
			expect(perm).not.toBeNull();
			expect(perm!.attr).toBe('email');
			expect(perm!.action).toEqual(['read']);
		});

		it('parses with manage action', () => {
			const perm = AccountPermission.fromString('account:repo?action=manage');
			expect(perm).not.toBeNull();
			expect(perm!.attr).toBe('repo');
			expect(perm!.action).toEqual(['manage']);
		});

		it('parses all valid attributes', () => {
			expect(AccountPermission.fromString('account:email')).not.toBeNull();
			expect(AccountPermission.fromString('account:repo')).not.toBeNull();
			expect(AccountPermission.fromString('account:status')).not.toBeNull();
		});

		it('returns null for invalid attribute', () => {
			expect(AccountPermission.fromString('account:invalid')).toBeNull();
		});

		it('returns null for invalid action', () => {
			expect(AccountPermission.fromString('account:email?action=invalid')).toBeNull();
		});

		it('returns null for malformed scope', () => {
			expect(AccountPermission.fromString('invalid:email')).toBeNull();
			expect(AccountPermission.fromString('account')).toBeNull();
			expect(AccountPermission.fromString('')).toBeNull();
			expect(AccountPermission.fromString('account:')).toBeNull();
		});
	});

	describe('matches', () => {
		it('matches exact attr and action', () => {
			const perm = AccountPermission.fromString('account:email?action=read')!;
			expect(perm.matches({ attr: 'email', action: 'read' })).toBe(true);
			expect(perm.matches({ attr: 'email', action: 'manage' })).toBe(false);
			expect(perm.matches({ attr: 'repo', action: 'read' })).toBe(false);
		});

		it('manage implies read', () => {
			const perm = AccountPermission.fromString('account:email?action=manage')!;
			expect(perm.matches({ attr: 'email', action: 'read' })).toBe(true);
			expect(perm.matches({ attr: 'email', action: 'manage' })).toBe(true);
		});

		it('default action is read', () => {
			const perm = AccountPermission.fromString('account:email')!;
			expect(perm.matches({ attr: 'email', action: 'read' })).toBe(true);
			expect(perm.matches({ attr: 'email', action: 'manage' })).toBe(false);
		});
	});

	describe('toString', () => {
		it('omits default action (read)', () => {
			const perm = new AccountPermission('email', ['read']);
			expect(perm.toString()).toBe('account:email');
		});

		it('includes non-default action', () => {
			const perm = new AccountPermission('email', ['manage']);
			expect(perm.toString()).toBe('account:email?action=manage');
		});
	});

	describe('normalization consistency', () => {
		const cases = [
			['account:email', 'account:email'],
			['account:email?action=manage', 'account:email?action=manage'],
			['account:repo', 'account:repo'],
			['account:repo?action=manage', 'account:repo?action=manage'],
			['account:status', 'account:status'],
			['account:status?action=manage', 'account:status?action=manage'],
		];

		for (const [input, expected] of cases) {
			it(`normalizes '${input}' to '${expected}'`, () => {
				const perm = AccountPermission.fromString(input);
				expect(perm).not.toBeNull();
				expect(perm!.toString()).toBe(expected);
			});
		}
	});
});
