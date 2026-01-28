/**
 * scope set - a collection of scopes with permission checking
 */

import { AccountPermission, type AccountPermissionMatch } from './permissions/account.js';
import { BlobPermission, type BlobPermissionMatch } from './permissions/blob.js';
import { IdentityPermission, type IdentityPermissionMatch } from './permissions/identity.js';
import { RepoPermission, type RepoPermissionMatch } from './permissions/repo.js';
import { RpcPermission, type RpcPermissionMatch } from './permissions/rpc.js';

// #region types

export type ResourceType = 'account' | 'blob' | 'identity' | 'repo' | 'rpc';

export interface ScopeMatchOptions {
	account: AccountPermissionMatch;
	blob: BlobPermissionMatch;
	identity: IdentityPermissionMatch;
	repo: RepoPermissionMatch;
	rpc: RpcPermissionMatch;
}

// #endregion

// #region scope set class

/**
 * a set of OAuth scopes with permission checking
 */
export class ScopeSet extends Set<string> {
	constructor(scopes?: Iterable<string> | string) {
		if (typeof scopes === 'string') {
			super(scopes.split(' ').filter((s) => s.length > 0));
		} else {
			super(scopes);
		}
	}

	/**
	 * checks if any scope in the set matches the requested access
	 * @param resource the resource type to check
	 * @param options the access being requested
	 * @returns true if access is allowed
	 */
	matches<R extends ResourceType>(resource: R, options: ScopeMatchOptions[R]): boolean {
		for (const scope of this) {
			if (matchesPermission(scope, resource, options)) {
				return true;
			}
		}
		return false;
	}
}

// #endregion

// #region matching helpers

const matchesPermission = <R extends ResourceType>(
	scope: string,
	resource: R,
	options: ScopeMatchOptions[R],
): boolean => {
	switch (resource) {
		case 'account': {
			const perm = AccountPermission.fromString(scope);
			return perm !== null && perm.matches(options as AccountPermissionMatch);
		}
		case 'blob': {
			const perm = BlobPermission.fromString(scope);
			return perm !== null && perm.matches(options as BlobPermissionMatch);
		}
		case 'identity': {
			const perm = IdentityPermission.fromString(scope);
			return perm !== null && perm.matches(options as IdentityPermissionMatch);
		}
		case 'repo': {
			const perm = RepoPermission.fromString(scope);
			return perm !== null && perm.matches(options as RepoPermissionMatch);
		}
		case 'rpc': {
			const perm = RpcPermission.fromString(scope);
			return perm !== null && perm.matches(options as RpcPermissionMatch);
		}
		default:
			return false;
	}
};

// #endregion
