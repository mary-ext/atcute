import type { Did } from '@atcute/lexicons';

import type { DPoPKey } from './dpop.js';
import type { PersistedAuthorizationServerMetadata } from './server.js';

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
	dpopKey: DPoPKey;
	info: ExchangeInfo;
	token: TokenInfo;
}
