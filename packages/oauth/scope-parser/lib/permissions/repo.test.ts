import { describe, expect, it } from 'vitest';

import { RepoPermission } from './repo.js';

describe('RepoPermission', () => {
	describe('fromString', () => {
		it('parses single collection', () => {
			const perm = RepoPermission.fromString('repo:com.example.foo');
			expect(perm).not.toBeNull();
			expect(perm!.collection).toEqual(['com.example.foo']);
			expect(perm!.action).toEqual(['create', 'update', 'delete']);
		});

		it('parses single collection with action', () => {
			const perm = RepoPermission.fromString('repo:com.example.foo?action=create');
			expect(perm).not.toBeNull();
			expect(perm!.collection).toEqual(['com.example.foo']);
			expect(perm!.action).toEqual(['create']);
		});

		it('parses single collection with multiple actions', () => {
			const perm = RepoPermission.fromString('repo:com.example.foo?action=create&action=update');
			expect(perm).not.toBeNull();
			expect(perm!.collection).toEqual(['com.example.foo']);
			expect(perm!.action).toEqual(['create', 'update']);
		});

		it('parses wildcard collection', () => {
			const perm = RepoPermission.fromString('repo:*');
			expect(perm).not.toBeNull();
			expect(perm!.collection).toEqual(['*']);
			expect(perm!.action).toEqual(['create', 'update', 'delete']);
		});

		it('parses wildcard collection with action', () => {
			const perm = RepoPermission.fromString('repo:*?action=create');
			expect(perm).not.toBeNull();
			expect(perm!.collection).toEqual(['*']);
			expect(perm!.action).toEqual(['create']);
		});

		it('parses multiple collections via query params', () => {
			const perm = RepoPermission.fromString('repo?collection=com.example.foo&collection=com.example.bar');
			expect(perm).not.toBeNull();
			// should be sorted
			expect(perm!.collection).toEqual(['com.example.bar', 'com.example.foo']);
		});

		it('returns null for invalid collection', () => {
			expect(RepoPermission.fromString('repo:foo bar')).toBeNull();
			expect(RepoPermission.fromString('repo:.foo')).toBeNull();
			expect(RepoPermission.fromString('repo:bar.')).toBeNull();
			expect(RepoPermission.fromString('repo:invalid')).toBeNull();
		});

		it('returns null for invalid action', () => {
			expect(RepoPermission.fromString('repo:com.example.foo?action=invalid')).toBeNull();
			expect(RepoPermission.fromString('repo:*?action=*')).toBeNull();
		});

		it('returns null for non-repo scope', () => {
			expect(RepoPermission.fromString('invalid')).toBeNull();
			expect(RepoPermission.fromString('scope')).toBeNull();
		});

		it('returns null for missing collection', () => {
			expect(RepoPermission.fromString('repo')).toBeNull();
			expect(RepoPermission.fromString('repo?action=create')).toBeNull();
		});

		it('returns null for unknown params', () => {
			expect(RepoPermission.fromString('repo:com.example.foo?invalid=param')).toBeNull();
		});
	});

	describe('matches', () => {
		it('matches exact collection and action', () => {
			const perm = RepoPermission.fromString('repo:com.example.foo?action=create')!;
			expect(perm.matches({ action: 'create', collection: 'com.example.foo' })).toBe(true);
			expect(perm.matches({ action: 'update', collection: 'com.example.foo' })).toBe(false);
			expect(perm.matches({ action: 'create', collection: 'com.example.bar' })).toBe(false);
		});

		it('matches wildcard collection', () => {
			const perm = RepoPermission.fromString('repo:*?action=create')!;
			expect(perm.matches({ action: 'create', collection: 'com.example.foo' })).toBe(true);
			expect(perm.matches({ action: 'create', collection: 'com.example.bar' })).toBe(true);
			expect(perm.matches({ action: 'delete', collection: 'com.example.foo' })).toBe(false);
		});

		it('matches multiple actions', () => {
			const perm = RepoPermission.fromString('repo:com.example.foo?action=create&action=update')!;
			expect(perm.matches({ action: 'create', collection: 'com.example.foo' })).toBe(true);
			expect(perm.matches({ action: 'update', collection: 'com.example.foo' })).toBe(true);
			expect(perm.matches({ action: 'delete', collection: 'com.example.foo' })).toBe(false);
		});

		it('matches default actions (all)', () => {
			const perm = RepoPermission.fromString('repo:com.example.foo')!;
			expect(perm.matches({ action: 'create', collection: 'com.example.foo' })).toBe(true);
			expect(perm.matches({ action: 'update', collection: 'com.example.foo' })).toBe(true);
			expect(perm.matches({ action: 'delete', collection: 'com.example.foo' })).toBe(true);
		});

		it('matches wildcard collection with all actions', () => {
			const perm = RepoPermission.fromString('repo:*')!;
			expect(perm.matches({ action: 'create', collection: 'any.collection.here' })).toBe(true);
			expect(perm.matches({ action: 'update', collection: 'any.collection.here' })).toBe(true);
			expect(perm.matches({ action: 'delete', collection: 'any.collection.here' })).toBe(true);
		});
	});

	describe('toString', () => {
		it('uses positional for single collection', () => {
			const perm = new RepoPermission(['com.example.foo'], ['create']);
			expect(perm.toString()).toBe('repo:com.example.foo?action=create');
		});

		it('omits default actions', () => {
			const perm = new RepoPermission(['com.example.foo'], ['create', 'update', 'delete']);
			expect(perm.toString()).toBe('repo:com.example.foo');
		});

		it('uses query params for multiple collections', () => {
			const perm = new RepoPermission(['com.example.foo', 'com.example.bar'], ['create']);
			const str = perm.toString();
			expect(str).toContain('collection=com.example.bar');
			expect(str).toContain('collection=com.example.foo');
			expect(str).toContain('action=create');
		});

		it('normalizes wildcard collection', () => {
			const perm = RepoPermission.fromString('repo?collection=*&collection=com.example.foo')!;
			expect(perm.toString()).toBe('repo:*');
		});

		it('normalizes all actions', () => {
			const perm = RepoPermission.fromString('repo:*?action=create&action=update&action=delete')!;
			expect(perm.toString()).toBe('repo:*');
		});
	});

	describe('normalization consistency', () => {
		const cases = [
			['repo:com.example.foo', 'repo:com.example.foo'],
			['repo:com.example.foo?action=create', 'repo:com.example.foo?action=create'],
			['repo:com.example.foo?action=create&action=update', 'repo:com.example.foo?action=create&action=update'],
			['repo:*?action=create&action=update&action=delete', 'repo:*'],
			['repo:com.example.foo?action=create&action=update&action=delete', 'repo:com.example.foo'],
			['repo:*?action=create', 'repo:*?action=create'],
			['repo:*?action=update', 'repo:*?action=update'],
			['repo?collection=*&action=update', 'repo:*?action=update'],
			['repo?collection=*&collection=com.example.foo&action=update', 'repo:*?action=update'],
			['repo?collection=*', 'repo:*'],
			['repo?collection=*&action=create&action=update&action=delete', 'repo:*'],
			['repo?collection=*&collection=com.example.foo', 'repo:*'],
			['repo?action=create&collection=com.example.foo', 'repo:com.example.foo?action=create'],
			['repo?collection=com.example.foo&action=create&action=update&action=delete', 'repo:com.example.foo'],
		];

		for (const [input, expected] of cases) {
			it(`normalizes '${input}' to '${expected}'`, () => {
				const perm = RepoPermission.fromString(input);
				expect(perm).not.toBeNull();
				expect(perm!.toString()).toBe(expected);
			});
		}
	});
});
