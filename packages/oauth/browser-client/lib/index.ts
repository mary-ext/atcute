export { configureOAuth, type ConfigureOAuthOptions } from './environment.js';

export * from './errors.js';

export * from './agents/exchange.js';
export * from './agents/server-agent.js';
export * from './agents/sessions.js';
export * from './agents/user-agent.js';

export type {
	AtprotoOAuthTokenResponse as OAuthTokenResponse,
	OAuthAuthorizationServerMetadata as AuthorizationServerMetadata,
	OAuthClientMetadata as ClientMetadata,
	OAuthParResponse,
	OAuthProtectedResourceMetadata as ProtectedResourceMetadata,
} from '@atcute/oauth-types';

export * from './types/client-assertion.js';
export * from './types/dpop.js';
export * from './types/identity.js';
export * from './types/server.js';
export * from './types/store.js';
export * from './types/token.js';

export * from './utils/identity-resolver.js';
