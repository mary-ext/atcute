import { describe, expect, it } from 'vitest';

import { ScopeSet } from './scope-set.js';

describe('ScopeSet', () => {
	describe('constructor', () => {
		it('accepts space-separated string', () => {
			const set = new ScopeSet('repo:com.example.foo account:email');
			expect(set.size).toBe(2);
			expect(set.has('repo:com.example.foo')).toBe(true);
			expect(set.has('account:email')).toBe(true);
		});

		it('accepts iterable', () => {
			const set = new ScopeSet(['repo:com.example.foo', 'account:email']);
			expect(set.size).toBe(2);
		});

		it('handles empty string', () => {
			const set = new ScopeSet('');
			expect(set.size).toBe(0);
		});
	});

	describe('matches', () => {
		it('matches account access', () => {
			const set = new ScopeSet('account:email');
			expect(set.matches('account', { attr: 'email', action: 'read' })).toBe(true);
			expect(set.matches('account', { attr: 'email', action: 'manage' })).toBe(false);
			expect(set.matches('account', { attr: 'repo', action: 'read' })).toBe(false);
		});

		it('matches blob access', () => {
			const set = new ScopeSet('blob:*/*');
			expect(set.matches('blob', { mime: 'image/png' })).toBe(true);
			expect(set.matches('blob', { mime: 'application/json' })).toBe(true);
		});

		it('matches blob subtype wildcard', () => {
			const set = new ScopeSet('blob:image/*');
			expect(set.matches('blob', { mime: 'image/png' })).toBe(true);
			expect(set.matches('blob', { mime: 'application/json' })).toBe(false);
		});

		it('rejects invalid blob scopes', () => {
			expect(new ScopeSet('blob:*').matches('blob', { mime: 'image/png' })).toBe(false);
			expect(new ScopeSet('blob:/image').matches('blob', { mime: 'image/png' })).toBe(false);
		});

		it('matches repo wildcard collection', () => {
			const set = new ScopeSet('repo:*');
			expect(set.matches('repo', { collection: 'com.example.foo', action: 'create' })).toBe(true);
			expect(set.matches('repo', { collection: 'com.example.foo', action: 'update' })).toBe(true);
			expect(set.matches('repo', { collection: 'app.bsky.feed.post', action: 'delete' })).toBe(true);
		});

		it('matches repo wildcard with specific action', () => {
			const set = new ScopeSet('repo:*?action=create');
			expect(set.matches('repo', { collection: 'com.example.foo', action: 'create' })).toBe(true);
			expect(set.matches('repo', { collection: 'app.bsky.feed.post', action: 'create' })).toBe(true);
			expect(set.matches('repo', { collection: 'com.example.foo', action: 'update' })).toBe(false);
		});

		it('matches repo specific collection with action', () => {
			const set = new ScopeSet('repo:com.example.foo?action=create');
			expect(set.matches('repo', { collection: 'com.example.foo', action: 'create' })).toBe(true);
			expect(set.matches('repo', { collection: 'com.example.foo', action: 'update' })).toBe(false);
			expect(set.matches('repo', { collection: 'app.bsky.feed.post', action: 'create' })).toBe(false);
		});

		it('rejects invalid repo scopes', () => {
			const set = new ScopeSet('repo:not-a-valid-nsid');
			expect(set.matches('repo', { collection: 'not-a-valid-nsid', action: 'create' })).toBe(false);
		});

		it('rejects invalid rpc scopes', () => {
			const set = new ScopeSet('rpc:*?lxm=*');
			expect(set.matches('rpc', { aud: 'did:web:example.com#service', lxm: 'com.example.method' })).toBe(false);
		});

		it('matches rpc wildcard aud', () => {
			const set = new ScopeSet('rpc:app.bsky.feed.getFeed?aud=*');
			expect(set.matches('rpc', { aud: 'did:web:example.com#service', lxm: 'app.bsky.feed.getFeed' })).toBe(true);
			expect(set.matches('rpc', { aud: 'did:plc:blahbla#service', lxm: 'app.bsky.feed.getFeed' })).toBe(true);
			expect(set.matches('rpc', { aud: 'did:web:example.com#service', lxm: 'com.example.method' })).toBe(false);
		});

		it('matches rpc wildcard lxm', () => {
			const set = new ScopeSet('rpc:*?aud=did:web:example.com%23foo');
			expect(set.matches('rpc', { aud: 'did:web:example.com#foo', lxm: 'com.example.method' })).toBe(true);
			expect(set.matches('rpc', { aud: 'did:web:example.com#foo', lxm: 'app.bsky.feed.getFeed' })).toBe(true);
			expect(set.matches('rpc', { aud: 'did:web:bar.com#foo', lxm: 'com.example.method' })).toBe(false);
			expect(set.matches('rpc', { aud: 'did:web:example.com#bar', lxm: 'com.example.method' })).toBe(false);
		});

		it('matches rpc specific lxm and aud', () => {
			const set = new ScopeSet('rpc:app.bsky.feed.getFeed?aud=did:web:example.com%23foo');
			expect(set.matches('rpc', { aud: 'did:web:example.com#foo', lxm: 'app.bsky.feed.getFeed' })).toBe(true);
			expect(set.matches('rpc', { aud: 'did:web:example.com#bar', lxm: 'com.example.method' })).toBe(false);
			expect(set.matches('rpc', { aud: 'did:plc:blahbla#service', lxm: 'app.bsky.feed.getFeed' })).toBe(false);
		});

		it('matches identity access', () => {
			const set = new ScopeSet('identity:handle');
			expect(set.matches('identity', { attr: 'handle' })).toBe(true);
			expect(set.matches('identity', { attr: '*' })).toBe(false);
		});

		it('matches identity wildcard', () => {
			const set = new ScopeSet('identity:*');
			expect(set.matches('identity', { attr: 'handle' })).toBe(true);
			expect(set.matches('identity', { attr: '*' })).toBe(true);
		});

	});
});
