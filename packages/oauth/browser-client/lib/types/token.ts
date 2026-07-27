import type { Did } from '@atcute/lexicons';
import type { DpopPrivateJwk } from '@atcute/oauth-crypto';

import type { PersistedAuthorizationServerMetadata } from './server.ts';

export interface TokenInfo {
	scope: string;
	type: string;
	expires_at?: number;
	refresh?: string;
	access: string;
}

export interface ExchangeInfo {
	sub: Did;
	aud: string;
	server: PersistedAuthorizationServerMetadata;
}

export interface Session {
	dpopKey: DpopPrivateJwk;
	info: ExchangeInfo;
	token: TokenInfo;
}
