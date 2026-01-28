import type { Did } from '@atcute/lexicons';
import type { DpopPrivateJwk } from '@atcute/oauth-crypto';

import type { ClientAuthMethod } from '../oauth-client-auth.js';
import type { Store } from '../utils/store.js';

/**
 * stored authorization state, keyed by state ID (short-lived).
 */
export interface StoredState {
	/** DPoP private key */
	dpopKey: DpopPrivateJwk;
	/** client authentication method */
	authMethod: ClientAuthMethod;
	/** PKCE code verifier */
	pkceVerifier: string;
	/** authorization server issuer URL */
	issuer: string;
	/** redirect URI used (for token exchange) */
	redirectUri: string;
	/** expected DID if resolved during authorize() */
	sub?: Did;
	/** user-provided state to pass through */
	userState?: unknown;
	/** expiry unix timestamp (typically ~10 minutes) */
	expiresAt: number;
}

/** authorization state store, keyed by state ID */
export type StateStore = Store<string, StoredState>;
