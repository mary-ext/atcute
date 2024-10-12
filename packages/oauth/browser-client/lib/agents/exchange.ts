import { createES256Key } from '../dpop.js';
import { CLIENT_ID, database, REDIRECT_URI } from '../environment.js';
import { AuthorizationError, LoginError } from '../errors.js';
import type { IdentityMetadata } from '../types/identity.js';
import type { AuthorizationServerMetadata } from '../types/server.js';
import type { Session } from '../types/token.js';
import { generatePKCE, generateState } from '../utils/runtime.js';

import { OAuthServerAgent } from './server-agent.js';
import { storeSession } from './sessions.js';

export interface AuthorizeOptions {
	metadata: AuthorizationServerMetadata;
	identity?: IdentityMetadata;
	scope: string;
}

/**
 * Create authentication URL for authorization
 * @param options
 * @returns URL to redirect the user for authorization
 */
export const createAuthorizationUrl = async ({
	metadata,
	identity,
	scope,
}: AuthorizeOptions): Promise<URL> => {
	const state = generateState();

	const pkce = await generatePKCE();
	const dpopKey = await createES256Key();

	const params = {
		redirect_uri: REDIRECT_URI,
		code_challenge: pkce.challenge,
		code_challenge_method: pkce.method,
		state: state,
		login_hint: identity?.raw,
		response_mode: 'fragment',
		response_type: 'code',
		display: 'page',
		// id_token_hint: undefined,
		// max_age: undefined,
		// prompt: undefined,
		scope: scope,
		// ui_locales: undefined,
	} satisfies Record<string, string | undefined>;

	database.states.set(state, {
		dpopKey: dpopKey,
		metadata: metadata,
		verifier: pkce.verifier,
	});

	const server = new OAuthServerAgent(metadata, dpopKey);
	const response = await server.request('pushed_authorization_request', params);

	const authUrl = new URL(metadata.authorization_endpoint);
	authUrl.searchParams.set('client_id', CLIENT_ID);
	authUrl.searchParams.set('request_uri', response.request_uri);

	return authUrl;
};

/**
 * Finalize authorization
 * @param params Search params
 * @returns Session object, which you can use to instantiate user agents
 */
export const finalizeAuthorization = async (params: URLSearchParams) => {
	const issuer = params.get('iss');
	const state = params.get('state');
	const code = params.get('code');
	const error = params.get('error');

	if (!state || !(code || error)) {
		throw new LoginError(`missing parameters`);
	}

	const stored = database.states.get(state);
	if (stored) {
		// Delete now that we've caught it
		database.states.delete(state);
	} else {
		throw new LoginError(`unknown state provided`);
	}

	const dpopKey = stored.dpopKey;
	const metadata = stored.metadata;

	if (error) {
		throw new AuthorizationError(params.get('error_description') || error);
	}
	if (!code) {
		throw new LoginError(`missing code parameter`);
	}

	if (issuer === null) {
		throw new LoginError(`missing issuer parameter`);
	} else if (issuer !== metadata.issuer) {
		throw new LoginError(`issuer mismatch`);
	}

	// Retrieve authentication tokens
	const server = new OAuthServerAgent(metadata, dpopKey);
	const { info, token } = await server.exchangeCode(code, stored.verifier);

	// We're finished!
	const sub = info.sub;
	const session: Session = { dpopKey, info, token };

	await storeSession(sub, session);

	return session;
};
