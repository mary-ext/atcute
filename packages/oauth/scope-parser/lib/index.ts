// syntax parsing
export {
	formatScopeString,
	getMultiParam,
	getSingleParam,
	hasUnknownParams,
	hasScopePrefix,
	parseScopeString,
	type FormatScopeOptions,
	type NeRoArray,
	type ScopeSyntax,
} from './syntax.js';

// MIME utilities
export { isAccept, isMime, isRedundantAccept, matchesAccept, matchesAnyAccept } from './mime.js';

// permission classes
export {
	AccountPermission,
	ACCOUNT_ACTIONS,
	ACCOUNT_ATTRIBUTES,
	type AccountAction,
	type AccountAttr,
	type AccountPermissionMatch,
} from './permissions/account.js';

export { BlobPermission, type Accept, type BlobPermissionMatch } from './permissions/blob.js';

export {
	IdentityPermission,
	IDENTITY_ATTRIBUTES,
	type IdentityAttr,
	type IdentityPermissionMatch,
} from './permissions/identity.js';

export {
	IncludeScope,
	type ExpandedPermissions,
	type IncludeScopeData,
	type LexiconBlobPermission,
	type LexiconPermission,
	type LexiconPermissionSet,
	type LexiconRepoPermission,
	type LexiconRpcPermission,
	type RejectedPermission,
	type RejectionReason,
} from './permissions/include.js';

export {
	RepoPermission,
	REPO_ACTIONS,
	type CollectionParam,
	type RepoAction,
	type RepoPermissionMatch,
} from './permissions/repo.js';

export {
	RpcPermission,
	type AudParam,
	type LxmParam,
	type RpcPermissionMatch,
} from './permissions/rpc.js';

// scope set
export { ScopeSet, type ResourceType, type ScopeMatchOptions } from './scope-set.js';

// normalization
export {
	hasAtprotoScope,
	normalizeScopes,
	normalizeScopeValue,
	STATIC_SCOPES,
	type StaticScope,
	validateScopes,
} from './normalize.js';
