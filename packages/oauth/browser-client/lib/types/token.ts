import type { At } from '@atcute/client/lexicons';

import type { DPoPKey } from './dpop.js';
import type { PersistedAuthorizationServerMetadata } from './server.js';

export interface OAuthTokenResponse {
	access_token: string;
	// Can be DPoP or Bearer, normalize casing.
	token_type: string;
	issuer?: string;
	sub?: string;
	scope?: string;
	id_token?: `${string}.${string}.${string}`;
	refresh_token?: string;
	expires_in?: number;
	authorization_details?:
		| {
				type: string;
				locations?: string[];
				actions?: string[];
				datatypes?: string[];
				identifier?: string;
				privileges?: string[];
		  }[]
		| undefined;
}

export interface TokenInfo {
	scope: string;
	type: string;
	expires_at?: number;
	refresh?: string;
	access: string;
}

export interface ExchangeInfo {
	sub: At.DID;
	aud: string;
	server: PersistedAuthorizationServerMetadata;
}

export interface Session {
	dpopKey: DPoPKey;
	info: ExchangeInfo;
	token: TokenInfo;
}
