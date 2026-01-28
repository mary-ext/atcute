import { describe, expect, it } from 'vitest';

import { formatScopeString, hasScopePrefix, parseScopeString } from './syntax.js';

describe('parseScopeString', () => {
	it('parses prefix only', () => {
		const result = parseScopeString('my-res');
		expect(result.prefix).toBe('my-res');
		expect(result.positional).toBeUndefined();
		expect(result.params).toBeUndefined();
	});

	it('parses prefix with positional', () => {
		const result = parseScopeString('my-res:my-pos');
		expect(result.prefix).toBe('my-res');
		expect(result.positional).toBe('my-pos');
		expect(result.params).toBeUndefined();
	});

	it('parses prefix with empty positional', () => {
		const result = parseScopeString('my-res:');
		expect(result.prefix).toBe('my-res');
		expect(result.positional).toBe('');
		expect(result.params).toBeUndefined();
	});

	it('parses prefix with positional and params', () => {
		const result = parseScopeString('my-res:foo?x=value&y=value-y');
		expect(result.prefix).toBe('my-res');
		expect(result.positional).toBe('foo');
		expect(result.params?.get('x')).toBe('value');
		expect(result.params?.get('y')).toBe('value-y');
	});

	it('parses prefix with params only', () => {
		const result = parseScopeString('my-res?x=value&y=value-y');
		expect(result.prefix).toBe('my-res');
		expect(result.positional).toBeUndefined();
		expect(result.params?.get('x')).toBe('value');
		expect(result.params?.get('y')).toBe('value-y');
	});

	it('parses multiple values for same param', () => {
		const result = parseScopeString('my-res?x=foo&x=bar&x=baz');
		expect(result.prefix).toBe('my-res');
		expect(result.params?.getAll('x')).toEqual(['foo', 'bar', 'baz']);
	});

	it('handles colons in param values (DID)', () => {
		const result = parseScopeString('rpc:foo.bar?aud=did:foo:bar?lxm=bar.baz');
		expect(result.prefix).toBe('rpc');
		expect(result.positional).toBe('foo.bar');
		expect(result.params?.get('aud')).toBe('did:foo:bar?lxm=bar.baz');
	});

	it('decodes URL-encoded positional', () => {
		const result = parseScopeString('my-res:my%20pos');
		expect(result.positional).toBe('my pos');
	});

	it('decodes URL-encoded param values', () => {
		const result = parseScopeString('my-res?x=my%20value');
		expect(result.params?.get('x')).toBe('my value');
	});

	it('allows colon in positional', () => {
		const result = parseScopeString('my-res:my:pos');
		expect(result.positional).toBe('my:pos');
	});
});

describe('hasScopePrefix', () => {
	it('matches exact prefix', () => {
		expect(hasScopePrefix('prefix', 'prefix')).toBe(true);
	});

	it('matches prefix with positional', () => {
		expect(hasScopePrefix('prefix:positional', 'prefix')).toBe(true);
	});

	it('matches prefix with params', () => {
		expect(hasScopePrefix('prefix?param=value', 'prefix')).toBe(true);
	});

	it('does not match different prefix', () => {
		expect(hasScopePrefix('prefix', 'differentResource')).toBe(false);
	});

	it('does not match different prefix with positional', () => {
		expect(hasScopePrefix('differentResource:positional', 'prefix')).toBe(false);
	});

	it('does not match partial prefix', () => {
		expect(hasScopePrefix('prefix', 'prefi')).toBe(false);
		expect(hasScopePrefix('prefix:pos', 'prefi')).toBe(false);
		expect(hasScopePrefix('prefix?param=value', 'prefi')).toBe(false);
	});

	it('does not match suffix', () => {
		expect(hasScopePrefix('prefix', 'fix')).toBe(false);
		expect(hasScopePrefix('prefix:pos', 'fix')).toBe(false);
		expect(hasScopePrefix('prefix?param=value', 'fix')).toBe(false);
	});
});

describe('formatScopeString', () => {
	it('formats prefix only', () => {
		expect(formatScopeString({ prefix: 'repo' })).toBe('repo');
	});

	it('formats prefix with positional', () => {
		expect(formatScopeString({ prefix: 'repo', positional: 'com.example.foo' })).toBe('repo:com.example.foo');
	});

	it('formats prefix with params', () => {
		const params = new URLSearchParams();
		params.set('action', 'create');
		expect(formatScopeString({ prefix: 'repo', params })).toBe('repo?action=create');
	});

	it('formats prefix with positional and params', () => {
		const params = new URLSearchParams();
		params.set('action', 'create');
		expect(formatScopeString({ prefix: 'repo', positional: 'com.example.foo', params })).toBe(
			'repo:com.example.foo?action=create',
		);
	});

	it('normalizes URL encoding', () => {
		const params = new URLSearchParams();
		params.set('aud', 'did:web:example.com#service');
		// # should stay encoded, but : should be decoded
		expect(formatScopeString({ prefix: 'rpc', positional: 'foo.bar', params })).toBe(
			'rpc:foo.bar?aud=did:web:example.com%23service',
		);
	});
});
