import type { Did } from '@atcute/lexicons';

import type { AtprotoOAuthScope } from '../schemas/atproto-oauth-scope.js';

/**
 * token set returned from token operations (exchange, refresh).
 */
export interface TokenSet {
	/** authorization server issuer */
	iss: string;
	/** user's DID */
	sub: Did;
	/** resource server (PDS) URL */
	aud: string;
	/** granted scope */
	scope: AtprotoOAuthScope;

	/** access token */
	access_token: string;
	/** refresh token (if granted) */
	refresh_token?: string;
	/** token type (always DPoP for atproto) */
	token_type: 'DPoP';
	/** expiration time as unix timestamp (milliseconds) */
	expires_at?: number;
}
