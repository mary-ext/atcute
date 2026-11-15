import type { ActorResolver } from '@atcute/identity-resolver';
import type { Did } from '@atcute/lexicons';
import { generateClientAssertionKey } from '@atcute/oauth-crypto';
import type {
	AtprotoAuthorizationServerMetadata,
	AtprotoProtectedResourceMetadata,
} from '@atcute/oauth-types';

import { assert, describe, expect, it, vi } from 'vitest';

import { TokenInvalidError, TokenRefreshError, TokenRevokedError } from './errors.ts';
import { OAuthClient, type SessionIdGenerator } from './oauth-client.ts';
import type { SessionEvent } from './session-getter.ts';
import type { StoredSession } from './types/sessions.ts';
import type { StoredState } from './types/states.ts';
import { MemoryStore } from './utils/memory-store.ts';

const TEST_DID: Did = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz';
const PDS_URL = 'https://pds.example.com';
const ISSUER = 'https://auth.example.com';

const createAsMetadata = (): AtprotoAuthorizationServerMetadata => ({
	issuer: ISSUER,
	authorization_endpoint: `${ISSUER}/oauth/authorize`,
	token_endpoint: `${ISSUER}/oauth/token`,
	pushed_authorization_request_endpoint: `${ISSUER}/oauth/par`,
	revocation_endpoint: `${ISSUER}/oauth/revoke`,
	dpop_signing_alg_values_supported: ['ES256'],
	scopes_supported: ['atproto'],
	response_types_supported: ['code'],
	grant_types_supported: ['authorization_code', 'refresh_token'],
	code_challenge_methods_supported: ['S256'],
	token_endpoint_auth_methods_supported: ['private_key_jwt'],
	token_endpoint_auth_signing_alg_values_supported: ['ES256'],
	authorization_response_iss_parameter_supported: true,
	require_pushed_authorization_requests: true,
	client_id_metadata_document_supported: true,
});

const createPrMetadata = (): AtprotoProtectedResourceMetadata => ({
	resource: PDS_URL,
	authorization_servers: [ISSUER],
	scopes_supported: ['atproto'],
	bearer_methods_supported: ['header'],
});

const jsonResponse = (status: number, body?: unknown): Response => {
	return new Response(body !== undefined ? JSON.stringify(body) : null, {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
};

interface MockServerOptions {
	createSessionId?: SessionIdGenerator;
	onTokenRequest?: (params: URLSearchParams) => Response | Promise<Response>;
	onRevokeRequest?: (params: URLSearchParams) => Response | Promise<Response>;
	onResourceRequest?: (url: string, request: Request) => Response | Promise<Response>;
}

const createTestClient = async (serverOptions: MockServerOptions = {}) => {
	const key = await generateClientAssertionKey('main', 'ES256');
	const sessions = new MemoryStore<string, StoredSession>({});
	const states = new MemoryStore<string, StoredState>({});

	const revokedTokens: string[] = [];
	let tokenSeq = 0;

	const actorResolver: ActorResolver = {
		resolve: vi.fn<ActorResolver['resolve']>(async () => ({
			did: TEST_DID,
			handle: 'alice.example.com',
			pds: PDS_URL,
		})),
	};

	const mockFetch = vi.fn(async (input: string | URL | Request): Promise<Response> => {
		const url = input instanceof Request ? input.url : String(input);

		if (url === `${PDS_URL}/.well-known/oauth-protected-resource`) {
			return jsonResponse(200, createPrMetadata());
		}

		if (url === `${ISSUER}/.well-known/oauth-authorization-server`) {
			return jsonResponse(200, createAsMetadata());
		}

		if (url === `${ISSUER}/oauth/par`) {
			return jsonResponse(200, {
				request_uri: 'urn:ietf:params:oauth:request_uri:req-1',
				expires_in: 60,
			});
		}

		if (url === `${ISSUER}/oauth/token`) {
			const body = input instanceof Request ? await input.clone().text() : '';
			const params = new URLSearchParams(body);

			if (serverOptions.onTokenRequest) {
				return serverOptions.onTokenRequest(params);
			}

			tokenSeq += 1;
			return jsonResponse(200, {
				access_token: `access-${tokenSeq}`,
				refresh_token: `refresh-${tokenSeq}`,
				token_type: 'DPoP',
				expires_in: 3600,
				scope: 'atproto',
				sub: TEST_DID,
			});
		}

		if (url === `${ISSUER}/oauth/revoke`) {
			const body = input instanceof Request ? await input.clone().text() : '';
			const params = new URLSearchParams(body);
			const token = params.get('token');
			if (token) {
				revokedTokens.push(token);
			}

			if (serverOptions.onRevokeRequest) {
				return serverOptions.onRevokeRequest(params);
			}

			return jsonResponse(200);
		}

		if (url.startsWith(`${PDS_URL}/`) && serverOptions.onResourceRequest && input instanceof Request) {
			return serverOptions.onResourceRequest(url, input);
		}

		throw new Error(`unexpected fetch to ${url}`);
	});

	const oauth = new OAuthClient({
		metadata: {
			client_id: 'https://app.example.com/oauth-client-metadata.json',
			redirect_uris: ['https://app.example.com/oauth/callback'],
			scope: 'atproto',
		},
		keyset: [key],
		actorResolver,
		stores: { sessions, states },
		createSessionId: serverOptions.createSessionId,
		fetch: mockFetch,
	});

	const completeLogin = async (userState?: unknown) => {
		const { stateId } = await oauth.authorize({
			target: { type: 'account', identifier: TEST_DID },
			state: userState,
		});

		const params = new URLSearchParams({
			code: `code-${stateId}`,
			state: stateId,
			iss: ISSUER,
		});

		return oauth.callback(params);
	};

	return { oauth, sessions, states, revokedTokens, completeLogin };
};

describe('OAuthClient', () => {
	it('should default sessionId to sub for backward-compatible single-session usage', async () => {
		const { oauth, sessions, revokedTokens, completeLogin } = await createTestClient();

		const { session } = await completeLogin();

		expect(session.did).toBe(TEST_DID);
		expect(session.sub).toBe(TEST_DID);
		expect(session.sessionId).toBe(TEST_DID);
		expect(sessions.get(TEST_DID)?.tokenSet.access_token).toBe('access-1');

		const restored = await oauth.restore(TEST_DID);
		expect(restored.did).toBe(TEST_DID);
		expect(restored.sessionId).toBe(TEST_DID);

		await oauth.revoke(TEST_DID);
		expect(sessions.get(TEST_DID)).toBeUndefined();
		expect(revokedTokens).toEqual(['refresh-1']);
	});

	it('should store and manage multiple independent sessions for the same DID', async () => {
		let seq = 0;
		const { oauth, sessions, revokedTokens, completeLogin } = await createTestClient({
			createSessionId: () => `sid-${++seq}`,
		});

		const events: SessionEvent[] = [];
		oauth.addEventListener((event) => {
			events.push(event);
		});

		const { session: first } = await completeLogin();
		const { session: second } = await completeLogin();

		expect(first.did).toBe(TEST_DID);
		expect(first.sessionId).toBe('sid-1');
		expect(second.did).toBe(TEST_DID);
		expect(second.sessionId).toBe('sid-2');

		expect(sessions.get('sid-1')?.tokenSet.access_token).toBe('access-1');
		expect(sessions.get('sid-2')?.tokenSet.access_token).toBe('access-2');

		const restored1 = await oauth.restore('sid-1');
		const restored2 = await oauth.restore('sid-2');
		expect(restored1.sessionId).toBe('sid-1');
		expect(restored2.sessionId).toBe('sid-2');
		expect((await restored1.getTokenInfo()).sub).toBe(TEST_DID);
		expect((await restored2.getTokenInfo()).sub).toBe(TEST_DID);

		await oauth.revoke('sid-1');

		expect(revokedTokens).toEqual(['refresh-1']);
		expect(sessions.get('sid-1')).toBeUndefined();
		expect(sessions.get('sid-2')).toBeDefined();

		const deletedEvent = events.find((e) => e.type === 'deleted');
		assert(deletedEvent?.type === 'deleted');
		expect(deletedEvent).toMatchObject({
			type: 'deleted',
			sub: TEST_DID,
			sessionId: 'sid-1',
		});
		assert(deletedEvent.cause instanceof TokenRevokedError);
		expect(deletedEvent.cause.sessionId).toBe('sid-1');

		// second session remains usable
		const stillRestorable = await oauth.restore('sid-2');
		expect(stillRestorable.did).toBe(TEST_DID);
		expect(stillRestorable.sessionId).toBe('sid-2');
	});

	it('should pass verified sub and user state to createSessionId', async () => {
		const { oauth, sessions, completeLogin } = await createTestClient({
			createSessionId: async ({ sub, state }) => {
				assert(typeof state === 'object' && state !== null && 'deviceId' in state);
				assert(typeof state.deviceId === 'string');
				return `${sub}:${state.deviceId}`;
			},
		});

		const { session } = await completeLogin({ deviceId: 'browser-a' });

		const expectedKey = `${TEST_DID}:browser-a`;
		expect(session.did).toBe(TEST_DID);
		expect(session.sessionId).toBe(expectedKey);
		expect(sessions.get(expectedKey)).toBeDefined();

		const restored = await oauth.restore(expectedKey);
		expect(restored.did).toBe(TEST_DID);
		expect(restored.sessionId).toBe(expectedKey);
	});

	it('should revoke the new token and skip storing if createSessionId returns empty or throws', async () => {
		const emptyClient = await createTestClient({
			createSessionId: () => '',
		});

		await expect(emptyClient.completeLogin()).rejects.toThrow('sessionId must not be empty');
		expect(emptyClient.revokedTokens).toEqual(['refresh-1']);
		expect(emptyClient.sessions.get('')).toBeUndefined();
		expect(emptyClient.sessions.get(TEST_DID)).toBeUndefined();

		const throwingClient = await createTestClient({
			createSessionId: () => {
				throw new Error('generator failed');
			},
		});

		await expect(throwingClient.completeLogin()).rejects.toThrow('generator failed');
		expect(throwingClient.revokedTokens).toEqual(['refresh-1']);
		expect(throwingClient.sessions.get(TEST_DID)).toBeUndefined();
	});

	it('should best-effort revoke superseded grant when overwriting an existing sessionId', async () => {
		let shouldFailRevoke = false;
		const { sessions, revokedTokens, completeLogin } = await createTestClient({
			createSessionId: () => 'sid-shared',
			onRevokeRequest() {
				if (shouldFailRevoke) {
					return jsonResponse(500, { error: 'server_error' });
				}
				return jsonResponse(200);
			},
		});

		await completeLogin();
		expect(sessions.get('sid-shared')?.tokenSet.refresh_token).toBe('refresh-1');

		await completeLogin();
		expect(sessions.get('sid-shared')?.tokenSet.refresh_token).toBe('refresh-2');
		expect(revokedTokens).toEqual(['refresh-1']);

		// revocation failure for superseded grant must not fail login
		shouldFailRevoke = true;
		const { session: third } = await completeLogin();
		expect(third.sessionId).toBe('sid-shared');
		expect(sessions.get('sid-shared')?.tokenSet.refresh_token).toBe('refresh-3');
		expect(revokedTokens).toEqual(['refresh-1', 'refresh-2']);
	});

	it('should refresh only the targeted sessionId and emit updated event with sessionId', async () => {
		let seq = 0;
		const { oauth, sessions, completeLogin } = await createTestClient({
			createSessionId: () => `sid-${++seq}`,
		});

		await completeLogin();
		await completeLogin();

		// mark sid-1 stale
		const stored1 = sessions.get('sid-1')!;
		sessions.set('sid-1', {
			...stored1,
			tokenSet: { ...stored1.tokenSet, expires_at: Date.now() - 1_000 },
		});

		const events: SessionEvent[] = [];
		oauth.addEventListener((event) => {
			events.push(event);
		});

		const refreshed = await oauth.restore('sid-1');
		const info = await refreshed.getTokenInfo('auto');
		expect(info.sub).toBe(TEST_DID);
		expect(sessions.get('sid-1')?.tokenSet.access_token).toBe('access-3');
		expect(sessions.get('sid-2')?.tokenSet.access_token).toBe('access-2');

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'updated',
			sub: TEST_DID,
			sessionId: 'sid-1',
		});
	});

	it('should throw TokenRefreshError with sessionId and not emit deleted on store miss', async () => {
		const { oauth } = await createTestClient();

		const events: SessionEvent[] = [];
		oauth.addEventListener((event) => {
			events.push(event);
		});

		let caught: unknown;
		try {
			await oauth.restore('missing-id');
		} catch (err) {
			caught = err;
		}

		assert(caught instanceof TokenRefreshError);
		expect(caught.sessionId).toBe('missing-id');
		expect(events).toEqual([]);
	});

	it('should revoke only the signed-out sessionId via session.signOut()', async () => {
		let seq = 0;
		const { oauth, sessions, revokedTokens, completeLogin } = await createTestClient({
			createSessionId: () => `sid-${++seq}`,
		});

		const { session: first } = await completeLogin();
		await completeLogin();

		await first.signOut();

		expect(revokedTokens).toEqual(['refresh-1']);
		expect(sessions.get('sid-1')).toBeUndefined();
		expect(sessions.get('sid-2')).toBeDefined();

		const second = await oauth.restore('sid-2');
		expect(second.sessionId).toBe('sid-2');
	});

	it('should delete only the failing sessionId on 401 invalid_token after refresh', async () => {
		let seq = 0;
		const { oauth, sessions, completeLogin } = await createTestClient({
			createSessionId: () => `sid-${++seq}`,
			onResourceRequest() {
				return new Response(null, {
					status: 401,
					headers: {
						'WWW-Authenticate': 'DPoP error="invalid_token"',
					},
				});
			},
		});

		const { session: first } = await completeLogin();
		await completeLogin();

		const events: SessionEvent[] = [];
		oauth.addEventListener((event) => {
			events.push(event);
		});

		const res = await first.handle('/xrpc/com.atproto.server.getSession');
		expect(res.status).toBe(401);
		expect(sessions.get('sid-1')).toBeUndefined();
		expect(sessions.get('sid-2')).toBeDefined();

		const deleted = events.find((e) => e.type === 'deleted');
		assert(deleted?.type === 'deleted');
		expect(deleted).toMatchObject({
			type: 'deleted',
			sub: TEST_DID,
			sessionId: 'sid-1',
		});
		assert(deleted.cause instanceof TokenInvalidError);
		expect(deleted.cause.sessionId).toBe('sid-1');
	});
});
