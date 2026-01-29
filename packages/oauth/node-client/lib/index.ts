export { Keyset, type KeySearchOptions } from '@atcute/oauth-keyset';

export {
	exportPkcs8PrivateKey,
	generateClientAssertionKey,
	importClientAssertionPkcs8,
	type ClientAssertionPrivateJwk,
} from '@atcute/oauth-crypto';

export {
	buildClientMetadata,
	CLIENT_ASSERTION_TYPE_JWT_BEARER,
	FALLBACK_ALG,
	scope,
	type AtprotoAuthorizationServerMetadata,
	type AtprotoProtectedResourceMetadata,
	type ConfidentialClientMetadata,
	type OAuthAuthorizationServerMetadata,
	type OAuthClientMetadata,
	type OAuthProtectedResourceMetadata,
	type OAuthResponseMode,
} from '@atcute/oauth-types';

export {
	OAuthClient,
	type AuthorizationResult,
	type AuthorizeOptions,
	type AuthorizeTarget,
	type CallbackOptions,
	type CallbackResult,
	type OAuthClientOptions,
	type OAuthClientStores,
	type RestoreOptions,
} from './oauth-client.js';

export { OAuthSession } from './oauth-session.js';
export type { SessionEvent, SessionEventListener } from './session-getter.js';

export {
	AuthMethodUnsatisfiableError,
	OAuthCallbackError,
	OAuthResolverError,
	OAuthResponseError,
	TokenInvalidError,
	TokenRefreshError,
	TokenRevokedError,
} from './errors.js';

export type { LockFunction } from './utils/lock.js';
export { MemoryStore } from './utils/memory-store.js';
export type { Store } from './utils/store.js';

export type { AuthorizationServerMetadataCache } from './resolvers/authorization-server-metadata.js';
export type { ProtectedResourceMetadataCache } from './resolvers/protected-resource-metadata.js';
export type { SessionStore, StoredSession } from './types/sessions.js';
export type { StateStore, StoredState } from './types/states.js';
export type { TokenSet } from './types/token-set.js';
