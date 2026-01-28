/**
 * scope normalization
 *
 * normalizes scope strings to canonical form for comparison and storage
 */

import { AccountPermission } from './permissions/account.js';
import { BlobPermission } from './permissions/blob.js';
import { IdentityPermission } from './permissions/identity.js';
import { IncludeScope } from './permissions/include.js';
import { RepoPermission } from './permissions/repo.js';
import { RpcPermission } from './permissions/rpc.js';
import { hasScopePrefix } from './syntax.js';

// #region static scopes

export const STATIC_SCOPES = ['atproto', 'transition:email', 'transition:generic', 'transition:chat.bsky'] as const;

export type StaticScope = (typeof STATIC_SCOPES)[number];

const isStaticScope = (value: string): value is StaticScope => {
	return (STATIC_SCOPES as readonly string[]).includes(value);
};

// #endregion

// #region normalization

/**
 * normalizes a single scope value to canonical form
 * @param scope the scope to normalize
 * @returns normalized scope or null if invalid
 */
export const normalizeScopeValue = (scope: string): string | null => {
	// static scopes pass through as-is
	if (isStaticScope(scope)) {
		return scope;
	}

	// try each permission type
	if (hasScopePrefix(scope, 'repo')) {
		const perm = RepoPermission.fromString(scope);
		return perm?.toString() ?? null;
	}

	if (hasScopePrefix(scope, 'rpc')) {
		const perm = RpcPermission.fromString(scope);
		return perm?.toString() ?? null;
	}

	if (hasScopePrefix(scope, 'blob')) {
		const perm = BlobPermission.fromString(scope);
		return perm?.toString() ?? null;
	}

	if (hasScopePrefix(scope, 'account')) {
		const perm = AccountPermission.fromString(scope);
		return perm?.toString() ?? null;
	}

	if (hasScopePrefix(scope, 'identity')) {
		const perm = IdentityPermission.fromString(scope);
		return perm?.toString() ?? null;
	}

	if (hasScopePrefix(scope, 'include')) {
		const inc = IncludeScope.fromString(scope);
		return inc?.toString() ?? null;
	}

	// unknown scope type
	return null;
};

/**
 * normalizes a space-separated scope string
 * - parses and re-formats each scope to canonical form
 * - filters out invalid scopes
 * - deduplicates and sorts
 *
 * @param scopes the scope string to normalize
 * @returns normalized scope string
 */
export const normalizeScopes = (scopes: string): string => {
	const values = scopes.split(' ').filter((s) => s.length > 0);
	const normalized = new Set<string>();

	for (const value of values) {
		const norm = normalizeScopeValue(value);
		if (norm !== null) {
			normalized.add(norm);
		}
	}

	return [...normalized].sort().join(' ');
};

/**
 * validates that a scope string contains valid scopes
 * @param scopes the scope string to validate
 * @returns true if all scopes are valid
 */
export const validateScopes = (scopes: string): boolean => {
	const values = scopes.split(' ').filter((s) => s.length > 0);

	for (const value of values) {
		if (normalizeScopeValue(value) === null) {
			return false;
		}
	}

	return true;
};

/**
 * checks if a scope string contains the required 'atproto' scope
 * @param scopes the scope string to check
 * @returns true if 'atproto' scope is present
 */
export const hasAtprotoScope = (scopes: string): boolean => {
	const values = scopes.split(' ');
	return values.includes('atproto');
};

// #endregion
