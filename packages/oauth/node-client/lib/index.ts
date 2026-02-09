export { Keyset, type KeySearchOptions } from '@atcute/oauth-keyset';

export {
	exportPkcs8PrivateKey,
	generateClientAssertionKey,
	importClientAssertionPkcs8,
	type ClientAssertionPrivateJwk,
} from '@atcute/oauth-crypto';

export {
	buildClientMetadata,
	buildPublicClientMetadata,
	scope,
	type AtprotoAuthorizationServerMetadata,
	type AtprotoProtectedResourceMetadata,
	type ConfidentialClientMetadata,
	type DiscoverablePublicClientMetadata,
	type LoopbackClientMetadata,
	type OAuthAuthorizationServerMetadata,
	type OAuthClientMetadata,
	type OAuthProtectedResourceMetadata,
	type OAuthResponseMode,
	type PublicClientMetadata,
} from '@atcute/oauth-types';

export {
	OAuthClient,
	type AuthorizationResult,
	type AuthorizeOptions,
	type AuthorizeTarget,
	type CallbackOptions,
	type CallbackResult,
	type ConfidentialOAuthClientOptions,
	type OAuthClientOptions,
	type OAuthClientStores,
	type PublicOAuthClientOptions,
	type RestoreOptions,
} from './oauth-client.ts';

export { OAuthSession } from './oauth-session.ts';
export type { SessionEvent, SessionEventListener } from './session-getter.ts';

export {
	AuthMethodUnsatisfiableError,
	OAuthCallbackError,
	OAuthResolverError,
	OAuthResponseError,
	TokenInvalidError,
	TokenRefreshError,
	TokenRevokedError,
} from './errors.ts';

export type { LockFunction } from './utils/lock.ts';
export { MemoryStore } from './utils/memory-store.ts';
export type { Store } from './utils/store.ts';

export type { AuthorizationServerMetadataCache } from './resolvers/authorization-server-metadata.ts';
export type { ProtectedResourceMetadataCache } from './resolvers/protected-resource-metadata.ts';
export type {
	ClientAuthMethod,
	ConfidentialClientAuthMethod,
	PublicClientAuthMethod,
} from './oauth-client-auth.ts';
export type { SessionStore, StoredSession } from './types/sessions.ts';
export type { StateStore, StoredState } from './types/states.ts';
export type { TokenSet } from './types/token-set.ts';
