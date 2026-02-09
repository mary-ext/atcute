import type { ResolvedActor } from '@atcute/identity-resolver';
import type { ActorIdentifier } from '@atcute/lexicons';
import { generateDpopKey, generatePkce } from '@atcute/oauth-crypto';
import type { OAuthAuthorizationServerMetadata, OAuthPrompt } from '@atcute/oauth-types';

import { nanoid } from 'nanoid';

import { CLIENT_ID, database, REDIRECT_URI } from '../environment.ts';
import { AuthorizationError, LoginError } from '../errors.ts';
import { resolveFromIdentifier, resolveFromService } from '../resolvers.ts';
import type { Session } from '../types/token.ts';

import { OAuthServerAgent } from './server-agent.ts';
import { storeSession } from './sessions.ts';

export type AuthorizeTargetOptions =
	| { type: 'account'; identifier: ActorIdentifier }
	| { type: 'pds'; serviceUrl: string };

export interface AuthorizeOptions {
	target: AuthorizeTargetOptions;
	scope: string;
	state?: unknown;
	prompt?: OAuthPrompt | (string & {});
	display?: 'page' | 'popup' | 'touch' | 'wap';
	locale?: string;
}

/**
 * Create authentication URL for authorization
 * @param options
 * @returns URL to redirect the user for authorization
 */
export const createAuthorizationUrl = async (options: AuthorizeOptions): Promise<URL> => {
	const { target, scope, state = null, ...reqs } = options;

	let resolved: { identity?: ResolvedActor; metadata: OAuthAuthorizationServerMetadata };
	switch (target.type) {
		case 'account': {
			resolved = await resolveFromIdentifier(target.identifier);
			break;
		}
		case 'pds': {
			resolved = await resolveFromService(target.serviceUrl);
		}
	}

	const { identity, metadata } = resolved;
	const loginHint = identity
		? identity.handle !== 'handle.invalid'
			? identity.handle
			: identity.did
		: undefined;

	const sid = nanoid(24);

	const pkce = await generatePkce();
	const dpopKey = await generateDpopKey(['ES256']);

	const params = {
		display: reqs.display,
		ui_locales: reqs.locale,
		prompt: reqs.prompt,

		redirect_uri: REDIRECT_URI,
		code_challenge: pkce.challenge,
		code_challenge_method: pkce.method,
		state: sid,
		login_hint: loginHint,
		response_mode: 'fragment',
		response_type: 'code',
		scope: scope,
	} satisfies Record<string, string | undefined>;

	database.states.set(sid, {
		dpopKey: dpopKey,
		metadata: metadata,
		verifier: pkce.verifier,
		state: state,
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
	const sid = params.get('state');
	const code = params.get('code');
	const error = params.get('error');

	if (!sid || !(code || error)) {
		throw new LoginError(`missing parameters`);
	}

	const stored = database.states.get(sid);
	if (stored) {
		// Delete now that we've caught it
		database.states.delete(sid);
	} else {
		throw new LoginError(`unknown state provided`);
	}

	if (error) {
		throw new AuthorizationError(params.get('error_description') || error);
	}
	if (!code) {
		throw new LoginError(`missing code parameter`);
	}

	const dpopKey = stored.dpopKey;
	const metadata = stored.metadata;
	const state = stored.state ?? null;

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

	return { session, state };
};
