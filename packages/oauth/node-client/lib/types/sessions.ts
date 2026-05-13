import type { Did } from '@atcute/lexicons';
import type { DpopPrivateJwk } from '@atcute/oauth-crypto';

import type { ClientAuthMethod } from '../oauth-client-auth.ts';
import type { Store } from '../utils/store.ts';

import type { TokenSet } from './token-set.ts';

/** stored session data, keyed by DID. */
export interface StoredSession {
	/** DPoP private key */
	dpopKey: DpopPrivateJwk;
	/** client authentication method */
	authMethod: ClientAuthMethod;
	/** token data (includes iss, aud, sub, scope, tokens) */
	tokenSet: TokenSet;
}

/** session store, keyed by DID */
export type SessionStore = Store<Did, StoredSession>;
