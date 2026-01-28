import { describe, expect, it } from 'vitest';

import { RpcPermission } from './rpc.js';

describe('RpcPermission', () => {
	describe('fromString', () => {
		it('parses single lxm with DID audience', () => {
			const perm = RpcPermission.fromString('rpc:com.example.service?aud=did:web:example.com%23service_id');
			expect(perm).not.toBeNull();
			expect(perm!.aud).toBe('did:web:example.com#service_id');
			expect(perm!.lxm).toEqual(['com.example.service']);
		});

		it('parses single lxm with wildcard audience', () => {
			const perm = RpcPermission.fromString('rpc:com.example.method1?aud=*');
			expect(perm).not.toBeNull();
			expect(perm!.aud).toBe('*');
			expect(perm!.lxm).toEqual(['com.example.method1']);
		});

		it('parses via query params', () => {
			const perm = RpcPermission.fromString('rpc?lxm=com.example.method1&aud=*');
			expect(perm).not.toBeNull();
			expect(perm!.aud).toBe('*');
			expect(perm!.lxm).toEqual(['com.example.method1']);
		});

		it('parses multiple lxm via query params', () => {
			const perm = RpcPermission.fromString('rpc?aud=*&lxm=com.example.method1&lxm=com.example.method2');
			expect(perm).not.toBeNull();
			expect(perm!.aud).toBe('*');
			expect(perm!.lxm).toContain('com.example.method1');
			expect(perm!.lxm).toContain('com.example.method2');
		});

		it('decodes # in audience', () => {
			const perm = RpcPermission.fromString('rpc:com.example.service?aud=did:web:example.com#service_id');
			expect(perm).not.toBeNull();
			expect(perm!.aud).toBe('did:web:example.com#service_id');
		});

		it('returns null for missing aud', () => {
			expect(RpcPermission.fromString('rpc:com.example.service')).toBeNull();
			expect(RpcPermission.fromString('rpc?lxm=com.example.method1')).toBeNull();
		});

		it('returns null for missing lxm', () => {
			expect(RpcPermission.fromString('rpc?aud=did:web:example.com%23service_id')).toBeNull();
			expect(RpcPermission.fromString('rpc:?aud=did:web:example.com%23service_id')).toBeNull();
		});

		it('returns null for both positional and query lxm', () => {
			expect(
				RpcPermission.fromString(
					'rpc:com.example.method1?aud=did:web:example.com%23service_id&lxm=com.example.method2',
				),
			).toBeNull();
		});

		it('returns null for both wildcards', () => {
			expect(RpcPermission.fromString('rpc?aud=*&lxm=*')).toBeNull();
			expect(RpcPermission.fromString('rpc:*?aud=*')).toBeNull();
		});

		it('returns null for invalid aud', () => {
			expect(RpcPermission.fromString('rpc:com.example.service?aud=invalid')).toBeNull();
			expect(RpcPermission.fromString('rpc:foo.bar.baz?aud=did:web:example.com')).toBeNull(); // missing service ID
			expect(RpcPermission.fromString('rpc:foo.bar.baz?aud=did:plc:111')).toBeNull(); // missing service ID
		});

		it('returns null for invalid lxm', () => {
			expect(RpcPermission.fromString('rpc:invalid?aud=*')).toBeNull();
			expect(RpcPermission.fromString('rpc?lxm=invalid&aud=*')).toBeNull();
		});

		it('returns null for non-rpc scope', () => {
			expect(RpcPermission.fromString('invalid')).toBeNull();
			expect(RpcPermission.fromString('repo:com.example.foo')).toBeNull();
		});

		it('returns null for unknown params', () => {
			expect(
				RpcPermission.fromString('rpc:com.example.service?aud=did:web:example.com%23service_id&invalid=param'),
			).toBeNull();
		});
	});

	describe('matches', () => {
		it('matches exact lxm and aud', () => {
			const perm = RpcPermission.fromString('rpc:com.example.service?aud=did:web:example.com%23service_id')!;
			expect(perm.matches({ lxm: 'com.example.service', aud: 'did:web:example.com#service_id' })).toBe(true);
			expect(perm.matches({ lxm: 'com.example.OtherService', aud: 'did:web:example.com#service_id' })).toBe(false);
			expect(perm.matches({ lxm: 'com.example.service', aud: 'did:example:456#service_id' })).toBe(false);
		});

		it('matches wildcard aud', () => {
			const perm = RpcPermission.fromString('rpc:com.example.method1?aud=*')!;
			expect(perm.matches({ lxm: 'com.example.method1', aud: 'did:web:example.com#service_id' })).toBe(true);
			expect(perm.matches({ lxm: 'com.example.method1', aud: 'did:plc:abc123#other' })).toBe(true);
		});

		it('matches wildcard lxm', () => {
			const perm = RpcPermission.fromString('rpc:*?aud=did:web:example.com%23service_id')!;
			expect(perm.matches({ lxm: 'com.example.method1', aud: 'did:web:example.com#service_id' })).toBe(true);
			expect(perm.matches({ lxm: 'com.example.anyMethod', aud: 'did:web:example.com#service_id' })).toBe(true);
			expect(perm.matches({ lxm: 'com.example.method1', aud: 'did:web:other.com#service_id' })).toBe(false);
		});
	});

	describe('toString', () => {
		it('uses positional for single lxm', () => {
			const perm = new RpcPermission('did:web:example.com#service_id', ['com.example.service']);
			expect(perm.toString()).toBe('rpc:com.example.service?aud=did:web:example.com%23service_id');
		});

		it('uses query params for multiple lxm', () => {
			const perm = new RpcPermission('did:web:example.com#service_id', [
				'com.example.method1',
				'com.example.method2',
			]);
			expect(perm.toString()).toContain('lxm=com.example.method1');
			expect(perm.toString()).toContain('lxm=com.example.method2');
		});

		it('normalizes wildcard lxm', () => {
			const perm = new RpcPermission('did:web:example.com#service_id', ['*', 'com.example.method1']);
			expect(perm.toString()).toBe('rpc:*?aud=did:web:example.com%23service_id');
		});
	});

	describe('normalization consistency', () => {
		const cases = [
			[
				'rpc:com.example.service?aud=did:web:example.com%23service_id',
				'rpc:com.example.service?aud=did:web:example.com%23service_id',
			],
			[
				'rpc:com.example.service?aud=did:web:example.com#service_id',
				'rpc:com.example.service?aud=did:web:example.com%23service_id',
			],
			[
				'rpc?lxm=com.example.method1&lxm=com.example.method2&lxm=*&aud=did:web:example.com%23service_id',
				'rpc:*?aud=did:web:example.com%23service_id',
			],
			[
				'rpc?aud=did:web:example.com%23foo&lxm=com.example.service',
				'rpc:com.example.service?aud=did:web:example.com%23foo',
			],
			['rpc:com.example.method1?&aud=*', 'rpc:com.example.method1?aud=*'],
		];

		for (const [input, expected] of cases) {
			it(`normalizes '${input}' to '${expected}'`, () => {
				const perm = RpcPermission.fromString(input);
				expect(perm).not.toBeNull();
				expect(perm!.toString()).toBe(expected);
			});
		}
	});
});
