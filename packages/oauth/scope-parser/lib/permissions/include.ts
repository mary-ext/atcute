/**
 * include scope parsing and permission set expansion
 *
 * syntax: `include:<nsid>[?aud=<audience>]`
 * - nsid: the permission set lexicon NSID
 * - aud: optional audience that can be inherited by RPC permissions
 *
 * include scopes reference permission sets defined in lexicons.
 * the actual expansion to concrete permissions requires the lexicon definitions.
 *
 * ## permission set expansion
 *
 * permission sets are lexicon documents of type "permission-set" that define
 * collections of repo and rpc permissions. when a client requests an include
 * scope, the authorization server expands it into concrete permissions.
 *
 * example permission set (app.bsky.authCreatePosts):
 * ```json
 * {
 *   "lexicon": 1,
 *   "id": "app.bsky.authCreatePosts",
 *   "type": "permission-set",
 *   "permissions": [
 *     {
 *       "resource": "rpc",
 *       "inheritAud": true,
 *       "lxm": ["app.bsky.video.uploadVideo", "app.bsky.video.getJobStatus"]
 *     },
 *     {
 *       "resource": "repo",
 *       "action": ["create"],
 *       "collection": ["app.bsky.feed.post", "app.bsky.feed.postgate"]
 *     }
 *   ]
 * }
 * ```
 *
 * ## usage with lexicon resolver
 *
 * ```typescript
 * import { IncludeScope } from '@atcute/oauth-scope-parser';
 * import { createLexiconResolver } from '@atcute/lexicon-resolver';
 *
 * const resolver = createLexiconResolver({ ... });
 *
 * // parse the include scope
 * const include = IncludeScope.fromString('include:app.bsky.authCreatePosts?aud=did:web:bsky.social#atproto_pds');
 *
 * // resolve the permission set from the lexicon
 * const lexicon = await resolver.resolve(include.nsid);
 * const permissionSet = lexicon.def as LexiconPermissionSet;
 *
 * // expand to concrete permissions
 * const result = include.toPermissions(permissionSet);
 *
 * if (result.permissions.length > 0) {
 *   // use the expanded permissions for matching
 *   for (const perm of result.permissions) {
 *     if (perm instanceof RepoPermission) {
 *       // handle repo permission
 *     } else {
 *       // handle rpc permission
 *     }
 *   }
 * }
 *
 * // check for any rejected permissions (authority violations, etc.)
 * if (result.rejected.length > 0) {
 *   console.warn('some permissions were rejected:', result.rejected);
 * }
 * ```
 *
 * ## security: authority validation
 *
 * permission sets can only grant permissions within their own namespace authority.
 * for example, `include:app.bsky.authCreatePosts` can only grant permissions for:
 * - `app.bsky.*` collections and methods (same authority)
 *
 * it cannot grant permissions for:
 * - `com.example.*` (different authority)
 * - `*` wildcard (too broad)
 */

import { isNsid, type AtprotoAudience, type Nsid } from '@atcute/lexicons/syntax';

import {
	formatScopeString,
	getSingleParam,
	hasUnknownParams,
	hasScopePrefix,
	parseScopeString,
	type NeRoArray,
	type ScopeSyntax,
} from '../syntax.js';

import { RepoPermission, type RepoAction } from './repo.js';
import { RpcPermission } from './rpc.js';

// #region types

export interface IncludeScopeData {
	nsid: Nsid;
	aud: AtprotoAudience | undefined;
}

/** result of expanding an include scope into concrete permissions */
export interface ExpandedPermissions {
	/** successfully expanded permissions */
	permissions: (RepoPermission | RpcPermission)[];
	/** permissions that were rejected during expansion */
	rejected: RejectedPermission[];
}

/** a permission that was rejected during expansion */
export interface RejectedPermission {
	/** the original permission from the lexicon */
	permission: LexiconPermission;
	/** why the permission was rejected */
	reason: RejectionReason;
	/** additional detail about the rejection */
	detail?: string;
}

/** reasons why a permission might be rejected during expansion */
export type RejectionReason =
	| 'authority_violation' // permission targets NSID outside include scope's authority
	| 'invalid_collection' // collection is not a valid NSID
	| 'invalid_lxm' // lxm is not a valid NSID
	| 'invalid_action' // action is not a valid repo action
	| 'empty_collection' // no collections specified
	| 'empty_lxm' // no lxms specified
	| 'blob_not_allowed' // blob permissions not allowed in permission sets
	| 'specific_aud_not_allowed' // specific aud not allowed (must use inheritAud or *)
	| 'unknown_resource'; // unknown resource type

// #endregion

// #region validation

const KNOWN_KEYS = new Set(['nsid', 'aud']);

// audience must be a DID with a service ID (fragment)
const AUD_RE = /^did:(web|plc):[a-zA-Z0-9._:%-]+#[a-zA-Z0-9._-]+$/;

const isAtprotoAudience = (value: unknown): value is AtprotoAudience => {
	return typeof value === 'string' && AUD_RE.test(value);
};

// #endregion

// #region include scope class

export class IncludeScope {
	constructor(
		readonly nsid: Nsid,
		readonly aud: AtprotoAudience | undefined = undefined,
	) {}

	/**
	 * formats this include scope as a scope string
	 */
	toString(): string {
		const params = new URLSearchParams();

		if (this.aud !== undefined) {
			params.set('aud', this.aud);
		}

		return formatScopeString({ prefix: 'include', positional: this.nsid, params });
	}

	/**
	 * checks if this scope's NSID is a parent authority of the given NSID
	 * used to validate that permission sets only grant permissions under their own namespace
	 *
	 * @param otherNsid the NSID to check against
	 * @returns true if this scope's authority is a parent of the other NSID
	 */
	isParentAuthorityOf(otherNsid: '*' | Nsid): boolean {
		if (otherNsid === '*') {
			return false;
		}

		// extract authority (everything up to the last dot in the reversed domain)
		// e.g., for 'com.example.foo.auth', authority prefix is 'com.example.foo.'
		const groupPrefixEnd = this.nsid.lastIndexOf('.');
		if (groupPrefixEnd === -1) {
			return false;
		}

		const authorityPrefix = this.nsid.slice(0, groupPrefixEnd + 1);
		return otherNsid.startsWith(authorityPrefix);
	}

	/**
	 * expands this include scope into concrete permissions using the given permission set
	 *
	 * @param permissionSet the permission set definition from the lexicon
	 * @returns expanded permissions and any rejected entries
	 */
	toPermissions(permissionSet: LexiconPermissionSet): ExpandedPermissions {
		const permissions: (RepoPermission | RpcPermission)[] = [];
		const rejected: RejectedPermission[] = [];

		for (const perm of permissionSet.permissions) {
			switch (perm.resource) {
				case 'repo': {
					const result = this.expandRepoPermission(perm);
					if (result instanceof RepoPermission) {
						permissions.push(result);
					} else {
						rejected.push(result);
					}
					break;
				}
				case 'rpc': {
					const result = this.expandRpcPermission(perm);
					if (result instanceof RpcPermission) {
						permissions.push(result);
					} else {
						rejected.push(result);
					}
					break;
				}
				case 'blob':
					// blob permissions are not allowed in permission sets
					rejected.push({ permission: perm, reason: 'blob_not_allowed' });
					break;
				default:
					// unknown resource type
					rejected.push({ permission: perm as LexiconPermission, reason: 'unknown_resource' });
			}
		}

		return { permissions, rejected };
	}

	private expandRepoPermission(perm: LexiconRepoPermission): RepoPermission | RejectedPermission {
		// validate all collections are under our authority
		const validCollections: Nsid[] = [];
		for (const col of perm.collection) {
			if (!isNsid(col)) {
				return { permission: perm, reason: 'invalid_collection', detail: col };
			}
			if (!this.isParentAuthorityOf(col)) {
				return { permission: perm, reason: 'authority_violation', detail: col };
			}
			validCollections.push(col);
		}

		if (validCollections.length === 0) {
			return { permission: perm, reason: 'empty_collection' };
		}

		// validate actions
		const actions = perm.action ?? (['create', 'update', 'delete'] as const);
		for (const action of actions) {
			if (action !== 'create' && action !== 'update' && action !== 'delete') {
				return { permission: perm, reason: 'invalid_action', detail: action };
			}
		}

		return new RepoPermission(
			validCollections as unknown as NeRoArray<Nsid>,
			actions as unknown as NeRoArray<RepoAction>,
		);
	}

	private expandRpcPermission(perm: LexiconRpcPermission): RpcPermission | RejectedPermission {
		// determine audience
		let aud: '*' | AtprotoAudience;

		if (perm.inheritAud) {
			// inherit from include scope
			if (this.aud === undefined) {
				// no audience to inherit, use wildcard
				aud = '*';
			} else {
				aud = this.aud;
			}
		} else if (perm.aud === '*') {
			aud = '*';
		} else if (perm.aud !== undefined) {
			// specific audience in permission set - not allowed (must use inheritAud or *)
			return { permission: perm, reason: 'specific_aud_not_allowed', detail: perm.aud };
		} else {
			// no audience specified, use wildcard
			aud = '*';
		}

		// validate all lxms are under our authority
		const validLxms: Nsid[] = [];
		for (const lxm of perm.lxm) {
			if (!isNsid(lxm)) {
				return { permission: perm, reason: 'invalid_lxm', detail: lxm };
			}
			if (!this.isParentAuthorityOf(lxm)) {
				return { permission: perm, reason: 'authority_violation', detail: lxm };
			}
			validLxms.push(lxm);
		}

		if (validLxms.length === 0) {
			return { permission: perm, reason: 'empty_lxm' };
		}

		return new RpcPermission(aud, validLxms as unknown as NeRoArray<Nsid>);
	}

	/**
	 * parses a scope string into an IncludeScope
	 * @returns the scope or null if invalid
	 */
	static fromString(scope: string): IncludeScope | null {
		if (!hasScopePrefix(scope, 'include')) {
			return null;
		}
		return IncludeScope.fromSyntax(parseScopeString(scope));
	}

	/**
	 * parses a pre-parsed scope syntax into an IncludeScope
	 * @returns the scope or null if invalid
	 */
	static fromSyntax(syntax: ScopeSyntax): IncludeScope | null {
		if (syntax.prefix !== 'include') {
			return null;
		}

		// reject unknown parameters
		if (hasUnknownParams(syntax, KNOWN_KEYS)) {
			return null;
		}

		// parse nsid (required, positional)
		const nsidRaw = getSingleParam(syntax, 'nsid', 'nsid');
		if (nsidRaw === null || nsidRaw === undefined) {
			return null;
		}
		if (!isNsid(nsidRaw)) {
			return null;
		}

		// parse aud (optional)
		const audRaw = getSingleParam(syntax, 'aud');
		if (audRaw === null) {
			return null;
		}

		let aud: AtprotoAudience | undefined;
		if (audRaw !== undefined) {
			if (!isAtprotoAudience(audRaw)) {
				return null;
			}
			aud = audRaw;
		}

		return new IncludeScope(nsidRaw, aud);
	}
}

// #endregion

// #region permission set types

/**
 * represents a permission set definition from a lexicon
 */
export interface LexiconPermissionSet {
	permissions: LexiconPermission[];
}

export type LexiconPermission = LexiconRepoPermission | LexiconRpcPermission | LexiconBlobPermission;

export interface LexiconRepoPermission {
	resource: 'repo';
	collection: string[];
	action?: ('create' | 'update' | 'delete')[];
}

export interface LexiconRpcPermission {
	resource: 'rpc';
	lxm: string[];
	aud?: string;
	inheritAud?: boolean;
}

export interface LexiconBlobPermission {
	resource: 'blob';
	accept: string[];
}

// #endregion
