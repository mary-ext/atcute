export {
	exportJwkKey,
	exportPkcs8Key,
	generatePrivateKey,
	importJwkKey,
	importPkcs8Key,
	Keyset,
	type ImportKeyOptions,
	type KeySearchOptions,
	type PrivateKey,
	type SigningAlgorithm,
} from '@atcute/oauth-keyset';

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
	createClientAssertion,
	type ClientAssertionResult,
	type CreateClientAssertionOptions,
} from './client-assertion.js';
export type { DpopSecret } from './dpop-nonce.js';
export {
	computeJktFromJwk,
	DPoPVerifyError,
	verifyDPoP,
	type DPoPClaims,
	type DPoPVerifyOptions,
	type DPoPVerifyResult,
} from './dpop-verifier.js';
export { createCabHandler, registerCab, type CabOptions } from './handler.js';
