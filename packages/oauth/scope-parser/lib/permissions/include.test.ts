import { describe, expect, it } from 'vitest';

import { IncludeScope, type LexiconPermissionSet } from './include.js';
import { RepoPermission } from './repo.js';
import { RpcPermission } from './rpc.js';

describe('IncludeScope', () => {
	describe('fromString', () => {
		it('parses nsid only', () => {
			const scope = IncludeScope.fromString('include:com.example.bar');
			expect(scope).not.toBeNull();
			expect(scope!.nsid).toBe('com.example.bar');
			expect(scope!.aud).toBeUndefined();
		});

		it('parses nsid with aud', () => {
			const scope = IncludeScope.fromString('include:com.example.baz?aud=did:web:example.com%23my_service');
			expect(scope).not.toBeNull();
			expect(scope!.nsid).toBe('com.example.baz');
			expect(scope!.aud).toBe('did:web:example.com#my_service');
		});

		it('parses # in aud', () => {
			const scope = IncludeScope.fromString('include:com.example.baz?aud=did:web:example.com#my_service');
			expect(scope).not.toBeNull();
			expect(scope!.aud).toBe('did:web:example.com#my_service');
		});

		it('parses via query params', () => {
			const scope = IncludeScope.fromString('include?nsid=com.example.baz');
			expect(scope).not.toBeNull();
			expect(scope!.nsid).toBe('com.example.baz');
		});

		it('parses via query params with aud', () => {
			const scope = IncludeScope.fromString('include?aud=did:web:example.com%23my_service&nsid=com.example.baz');
			expect(scope).not.toBeNull();
			expect(scope!.nsid).toBe('com.example.baz');
			expect(scope!.aud).toBe('did:web:example.com#my_service');
		});

		it('returns null for invalid cases', () => {
			expect(IncludeScope.fromString('')).toBeNull();
			expect(IncludeScope.fromString('repo:com.example.baz')).toBeNull();
			expect(IncludeScope.fromString('include')).toBeNull();
			expect(IncludeScope.fromString('include#')).toBeNull();
			expect(IncludeScope.fromString('include:')).toBeNull();
			expect(IncludeScope.fromString('include:#')).toBeNull();
			expect(IncludeScope.fromString('include:&')).toBeNull();
		});

		it('returns null for invalid nsid', () => {
			expect(IncludeScope.fromString('include:com..example')).toBeNull(); // double dot
			expect(IncludeScope.fromString('include:com')).toBeNull(); // too short
			expect(IncludeScope.fromString('include:com.example')).toBeNull(); // too short
			expect(IncludeScope.fromString('include:9com.example.foo')).toBeNull(); // starts with digit
			expect(IncludeScope.fromString('include:com.example.-bar')).toBeNull(); // segment starts with dash
			expect(IncludeScope.fromString('include:invalid^nsid')).toBeNull(); // invalid character
			expect(IncludeScope.fromString('include:nsid')).toBeNull(); // too short
		});

		it('returns null for invalid aud', () => {
			expect(IncludeScope.fromString('include:com.example.baz?aud=')).toBeNull(); // empty aud
			expect(IncludeScope.fromString('include:com.example.baz?aud=did:web:example.com')).toBeNull(); // missing service ID
			expect(IncludeScope.fromString('include:com.example.baz?aud=invalid^did')).toBeNull(); // invalid aud
		});
	});

	describe('isParentAuthorityOf', () => {
		it('returns true for child nsids', () => {
			const scope = new IncludeScope('com.example.foo.auth');
			expect(scope.isParentAuthorityOf('com.example.foo.identifier')).toBe(true);
			expect(scope.isParentAuthorityOf('com.example.foo.bar.baz')).toBe(true);
		});

		it('returns false for sibling nsids', () => {
			const scope = new IncludeScope('com.example.foo.auth');
			expect(scope.isParentAuthorityOf('com.example.bar')).toBe(false);
		});

		it('returns false for different domain', () => {
			const scope = new IncludeScope('com.example.foo.auth');
			expect(scope.isParentAuthorityOf('com.atproto.foo')).toBe(false);
		});

		it('returns false for wildcard', () => {
			const scope = new IncludeScope('com.example.foo.auth');
			expect(scope.isParentAuthorityOf('*')).toBe(false);
		});
	});

	describe('toString', () => {
		it('formats nsid only', () => {
			const scope = new IncludeScope('com.example.bar');
			expect(scope.toString()).toBe('include:com.example.bar');
		});

		it('formats nsid with aud', () => {
			const scope = new IncludeScope('com.example.bar', 'did:web:example.com#my_service');
			expect(scope.toString()).toBe('include:com.example.bar?aud=did:web:example.com%23my_service');
		});
	});

	describe('toPermissions', () => {
		it('expands repo permissions', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'repo',
						collection: ['app.bsky.feed.post', 'app.bsky.feed.postgate'],
						action: ['create'],
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.rejected).toHaveLength(0);
			expect(result.permissions).toHaveLength(1);
			expect(result.permissions[0]).toBeInstanceOf(RepoPermission);

			const repoPerm = result.permissions[0] as RepoPermission;
			expect(repoPerm.matches({ collection: 'app.bsky.feed.post', action: 'create' })).toBe(true);
			expect(repoPerm.matches({ collection: 'app.bsky.feed.post', action: 'delete' })).toBe(false);
		});

		it('expands rpc permissions with inheritAud', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts', 'did:web:bsky.social#atproto_pds');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'rpc',
						inheritAud: true,
						lxm: ['app.bsky.video.uploadVideo', 'app.bsky.video.getJobStatus'],
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.rejected).toHaveLength(0);
			expect(result.permissions).toHaveLength(1);
			expect(result.permissions[0]).toBeInstanceOf(RpcPermission);

			const rpcPerm = result.permissions[0] as RpcPermission;
			expect(rpcPerm.aud).toBe('did:web:bsky.social#atproto_pds');
			expect(rpcPerm.matches({ lxm: 'app.bsky.video.uploadVideo', aud: 'did:web:bsky.social#atproto_pds' })).toBe(
				true,
			);
		});

		it('uses wildcard aud when inheritAud but no aud on include scope', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts'); // no aud
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'rpc',
						inheritAud: true,
						lxm: ['app.bsky.video.uploadVideo'],
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.rejected).toHaveLength(0);
			expect(result.permissions).toHaveLength(1);

			const rpcPerm = result.permissions[0] as RpcPermission;
			expect(rpcPerm.aud).toBe('*');
		});

		it('rejects repo permissions outside authority', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'repo',
						collection: ['com.example.other.collection'], // different authority
						action: ['create'],
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.permissions).toHaveLength(0);
			expect(result.rejected).toHaveLength(1);
			expect(result.rejected[0].reason).toBe('authority_violation');
		});

		it('rejects rpc permissions outside authority', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'rpc',
						inheritAud: true,
						lxm: ['com.example.other.method'], // different authority
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.permissions).toHaveLength(0);
			expect(result.rejected).toHaveLength(1);
			expect(result.rejected[0].reason).toBe('authority_violation');
		});

		it('rejects blob permissions', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'blob',
						accept: ['image/*'],
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.permissions).toHaveLength(0);
			expect(result.rejected).toHaveLength(1);
			expect(result.rejected[0].reason).toBe('blob_not_allowed');
		});

		it('rejects rpc permissions with specific aud', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'rpc',
						aud: 'did:web:specific.com#service', // specific aud not allowed
						lxm: ['app.bsky.video.uploadVideo'],
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.permissions).toHaveLength(0);
			expect(result.rejected).toHaveLength(1);
			expect(result.rejected[0].reason).toBe('specific_aud_not_allowed');
		});

		it('handles mixed valid and invalid permissions', () => {
			const scope = new IncludeScope('app.bsky.authCreatePosts');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'repo',
						collection: ['app.bsky.feed.post'], // valid
						action: ['create'],
					},
					{
						resource: 'repo',
						collection: ['com.example.other'], // invalid - different authority
						action: ['create'],
					},
					{
						resource: 'rpc',
						inheritAud: true,
						lxm: ['app.bsky.video.uploadVideo'], // valid
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.permissions).toHaveLength(2);
			expect(result.rejected).toHaveLength(1);
			expect(result.rejected[0].reason).toBe('authority_violation');
		});

		it('defaults to all actions when action not specified', () => {
			const scope = new IncludeScope('app.bsky.authFullApp');
			const permissionSet: LexiconPermissionSet = {
				permissions: [
					{
						resource: 'repo',
						collection: ['app.bsky.feed.post'],
						// no action specified - defaults to all
					},
				],
			};

			const result = scope.toPermissions(permissionSet);

			expect(result.permissions).toHaveLength(1);
			const repoPerm = result.permissions[0] as RepoPermission;
			expect(repoPerm.matches({ collection: 'app.bsky.feed.post', action: 'create' })).toBe(true);
			expect(repoPerm.matches({ collection: 'app.bsky.feed.post', action: 'update' })).toBe(true);
			expect(repoPerm.matches({ collection: 'app.bsky.feed.post', action: 'delete' })).toBe(true);
		});
	});
});
