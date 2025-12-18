import { describe, expect, it } from 'vitest';

import * as scope from './scope.js';

describe('scope builders', () => {
	describe('repo', () => {
		it('builds single collection without actions', () => {
			expect(scope.repo({ collection: ['com.example.foo'] })).toBe('repo?collection=com.example.foo');
		});

		it('builds single collection with single action', () => {
			expect(scope.repo({ collection: ['com.example.foo'], action: ['create'] })).toBe(
				'repo?collection=com.example.foo&action=create',
			);
		});

		it('builds single collection with multiple actions', () => {
			expect(scope.repo({ collection: ['com.example.foo'], action: ['create', 'update'] })).toBe(
				'repo?collection=com.example.foo&action=create&action=update',
			);
		});

		it('builds wildcard collection', () => {
			expect(scope.repo({ collection: ['*'] })).toBe('repo?collection=*');
		});

		it('builds wildcard collection with action', () => {
			expect(scope.repo({ collection: ['*'], action: ['create'] })).toBe('repo?collection=*&action=create');
		});

		it('builds multiple collections', () => {
			expect(scope.repo({ collection: ['com.example.foo', 'com.example.bar'] })).toBe(
				'repo?collection=com.example.foo&collection=com.example.bar',
			);
		});

		it('builds multiple collections with action', () => {
			expect(scope.repo({ collection: ['com.example.foo', 'com.example.bar'], action: ['create'] })).toBe(
				'repo?collection=com.example.foo&collection=com.example.bar&action=create',
			);
		});
	});

	describe('rpc', () => {
		it('builds single lxm with wildcard aud', () => {
			expect(scope.rpc({ lxm: ['com.example.method'], aud: '*' })).toBe('rpc?aud=*&lxm=com.example.method');
		});

		it('builds single lxm with DID audience', () => {
			expect(scope.rpc({ lxm: ['com.example.method'], aud: 'did:web:example.com#service' })).toBe(
				'rpc?aud=did:web:example.com%23service&lxm=com.example.method',
			);
		});

		it('builds wildcard lxm with DID audience', () => {
			expect(scope.rpc({ lxm: ['*'], aud: 'did:web:example.com#service' })).toBe(
				'rpc?aud=did:web:example.com%23service&lxm=*',
			);
		});

		it('builds multiple lxm', () => {
			expect(scope.rpc({ lxm: ['com.example.method1', 'com.example.method2'], aud: '*' })).toBe(
				'rpc?aud=*&lxm=com.example.method1&lxm=com.example.method2',
			);
		});

		it('builds multiple lxm with DID audience', () => {
			expect(
				scope.rpc({ lxm: ['com.example.method1', 'com.example.method2'], aud: 'did:web:example.com#service' }),
			).toBe('rpc?aud=did:web:example.com%23service&lxm=com.example.method1&lxm=com.example.method2');
		});
	});

	describe('account', () => {
		it('builds with attr only', () => {
			expect(scope.account({ attr: 'email' })).toBe('account?attr=email');
		});

		it('builds with read action', () => {
			expect(scope.account({ attr: 'email', action: 'read' })).toBe('account?attr=email&action=read');
		});

		it('builds with manage action', () => {
			expect(scope.account({ attr: 'email', action: 'manage' })).toBe('account?attr=email&action=manage');
		});

		it('builds with repo attr', () => {
			expect(scope.account({ attr: 'repo' })).toBe('account?attr=repo');
		});

		it('builds with status attr', () => {
			expect(scope.account({ attr: 'status' })).toBe('account?attr=status');
		});
	});

	describe('blob', () => {
		it('builds single accept', () => {
			expect(scope.blob({ accept: ['image/*'] })).toBe('blob?accept=image/*');
		});

		it('builds wildcard accept', () => {
			expect(scope.blob({ accept: ['*/*'] })).toBe('blob?accept=*/*');
		});

		it('builds multiple accept', () => {
			expect(scope.blob({ accept: ['image/*', 'video/*'] })).toBe('blob?accept=image/*&accept=video/*');
		});
	});

	describe('identity', () => {
		it('builds handle attr', () => {
			expect(scope.identity({ attr: 'handle' })).toBe('identity?attr=handle');
		});

		it('builds wildcard attr', () => {
			expect(scope.identity({ attr: '*' })).toBe('identity?attr=*');
		});
	});

	describe('include', () => {
		it('builds without aud', () => {
			expect(scope.include({ nsid: 'com.example.permissions' })).toBe('include?nsid=com.example.permissions');
		});

		it('builds with aud', () => {
			expect(scope.include({ nsid: 'com.example.permissions', aud: 'did:web:example.com#appview' })).toBe(
				'include?nsid=com.example.permissions&aud=did:web:example.com%23appview',
			);
		});
	});
});
