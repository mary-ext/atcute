export { Keyset, type KeySearchOptions } from '@atcute/oauth-keyset';

export {
	exportPkcs8PrivateKey,
	generateClientAssertionKey,
	importClientAssertionPkcs8,
	type ClientAssertionPrivateJwk,
} from '@atcute/oauth-crypto';

export { ClientAssertionBackend, isValidAud } from './backend.ts';
export type {
	ClientAssertionBackendOptions,
	DpopNonceProvider,
	IssuedAssertion,
	VerifiedDpop,
	VerifyResult,
} from './backend.ts';
export { MemoryDpopNonceProvider } from './nonce.ts';
export type { MemoryDpopNonceProviderOptions } from './nonce.ts';
