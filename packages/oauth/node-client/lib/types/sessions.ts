import type { JWK } from 'jose';

import type { Did } from '@atcute/lexicons';

import type { ClientAuthMethod } from '../oauth-client-auth.js';
import type { Store } from '../utils/store.js';
import type { TokenSet } from './token-set.js';

/**
 * stored session data, keyed by DID.
 */
export interface StoredSession {
	/** DPoP private key */
	dpopKey: JWK;
	/** client authentication method */
	authMethod: ClientAuthMethod;
	/** token data (includes iss, aud, sub, scope, tokens) */
	tokenSet: TokenSet;
}

/** session store, keyed by DID */
export type SessionStore = Store<Did, StoredSession>;
