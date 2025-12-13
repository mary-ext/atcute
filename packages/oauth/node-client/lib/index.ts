export { buildClientMetadata } from './build-client-metadata.js';
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
	exportJwkKey,
	exportPkcs8Key,
	generatePrivateKey,
	importJwkKey,
	importPkcs8Key,
} from './keyset/import-key.js';
export { Keyset } from './keyset/keyset.js';
export type { ImportKeyOptions, PrivateKey, SigningAlgorithm } from './keyset/types.js';

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

export type { DpopNonceCache } from './dpop/fetch-dpop.js';
export type { AuthorizationServerMetadataCache } from './resolvers/authorization-server-metadata.js';
export type { ProtectedResourceMetadataCache } from './resolvers/protected-resource-metadata.js';
export type { SessionStore, StoredSession } from './types/sessions.js';
export type { StateStore, StoredState } from './types/states.js';
export type { TokenSet } from './types/token-set.js';

export type { ConfidentialClientMetadata } from './schemas/atcute-confidential-client-metadata.js';
export type { AtprotoAuthorizationServerMetadata } from './schemas/atproto-authorization-server-metadata.js';
export type { AtprotoProtectedResourceMetadata } from './schemas/atproto-protected-resource-metadata.js';
export type { OAuthClientMetadata } from './schemas/oauth-client-metadata.js';
export type { OAuthResponseMode } from './schemas/oauth-response-mode.js';
