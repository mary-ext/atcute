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

export type { DpopSecret } from './dpop-nonce.js';
export { createCabHandler, registerCab, type CabOptions } from './handler.js';
