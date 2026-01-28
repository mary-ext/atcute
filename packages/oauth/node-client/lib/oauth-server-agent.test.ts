import type { Did } from '@atcute/lexicons';
import { generateClientAssertionKey, generateDpopKey } from '@atcute/oauth-crypto';
import { Keyset } from '@atcute/oauth-keyset';
import type { AtprotoAuthorizationServerMetadata } from '@atcute/oauth-types';

import { describe, expect, it, vi } from 'vitest';

import { OAuthResponseError, TokenRefreshError } from './errors.js';
import { OAuthServerAgent, type OAuthServerAgentOptions } from './oauth-server-agent.js';
import type { OAuthResolver } from './resolvers/index.js';
import { MemoryStore } from './utils/memory-store.js';

const createMockMetadata = (): AtprotoAuthorizationServerMetadata => ({
	issuer: 'https://auth.example.com',
	authorization_endpoint: 'https://auth.example.com/oauth/authorize',
	token_endpoint: 'https://auth.example.com/oauth/token',
	pushed_authorization_request_endpoint: 'https://auth.example.com/oauth/par',
	revocation_endpoint: 'https://auth.example.com/oauth/revoke',
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

const createMockResponse = (status: number, body?: unknown, headers?: Record<string, string>): Response => {
	return new Response(body ? JSON.stringify(body) : null, {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});
};

const createMockOAuthResolver = (overrides?: { issuer?: string; pds?: string }): OAuthResolver =>
	({
		resolveFromIdentity: vi.fn().mockResolvedValue({
			metadata: { issuer: overrides?.issuer ?? 'https://auth.example.com' },
			identity: { pds: overrides?.pds ?? 'https://pds.example.com' },
		}),
	}) as unknown as OAuthResolver;

const createServerAgent = async (
	options?: Partial<OAuthServerAgentOptions> & { mockFetch?: typeof fetch },
): Promise<OAuthServerAgent> => {
	const privateKey = await generateClientAssertionKey('dpop-key', 'ES256');
	const dpopKey = await generateDpopKey();
	const keyset = new Keyset([privateKey]);

	return new OAuthServerAgent({
		authMethod: { method: 'private_key_jwt', kid: 'dpop-key' },
		dpopKey,
		serverMetadata: options?.serverMetadata ?? createMockMetadata(),
		clientMetadata: {
			client_id: 'https://app.example.com/client-metadata.json',
			client_name: 'Test App',
			redirect_uris: ['https://app.example.com/callback'],
			grant_types: ['authorization_code', 'refresh_token'],
			response_types: ['code'],
			scope: 'atproto',
			application_type: 'web',
			dpop_bound_access_tokens: true,
			token_endpoint_auth_method: 'private_key_jwt',
			token_endpoint_auth_signing_alg: 'ES256',
		},
		dpopNonces: new MemoryStore({}),
		oauthResolver: options?.oauthResolver ?? createMockOAuthResolver(),
		keyset,
		fetch: options?.mockFetch,
	});
};

describe('OAuthServerAgent', () => {
	// valid DID format for testing (did:plc uses base32 encoding)
	const TEST_DID = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz';

	describe('exchangeCode', () => {
		it('should exchange code for tokens', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				createMockResponse(200, {
					access_token: 'access-123',
					refresh_token: 'refresh-123',
					token_type: 'DPoP',
					expires_in: 3600,
					scope: 'atproto',
					sub: TEST_DID,
				}),
			);

			const agent = await createServerAgent({ mockFetch });

			const result = await agent.exchangeCode('auth-code', 'verifier', 'https://app.example.com/callback');

			expect(result.access_token).toBe('access-123');
			expect(result.refresh_token).toBe('refresh-123');
			expect(result.sub).toBe(TEST_DID);
			expect(result.iss).toBe('https://auth.example.com');
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should verify issuer matches identity resolution', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				createMockResponse(200, {
					access_token: 'access-123',
					refresh_token: 'refresh-123',
					token_type: 'DPoP',
					scope: 'atproto',
					sub: TEST_DID,
				}),
			);

			const oauthResolver = createMockOAuthResolver({
				issuer: 'https://different-auth.example.com',
			});

			const agent = await createServerAgent({ mockFetch, oauthResolver });

			await expect(
				agent.exchangeCode('auth-code', 'verifier', 'https://app.example.com/callback'),
			).rejects.toThrow('issuer mismatch');

			// should have attempted to revoke
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it('should throw on error response', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				createMockResponse(400, {
					error: 'invalid_grant',
					error_description: 'code expired',
				}),
			);

			const agent = await createServerAgent({ mockFetch });

			await expect(
				agent.exchangeCode('expired-code', 'verifier', 'https://app.example.com/callback'),
			).rejects.toThrow(OAuthResponseError);
		});
	});

	describe('refresh', () => {
		it('should refresh token set', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				createMockResponse(200, {
					access_token: 'new-access-123',
					refresh_token: 'new-refresh-123',
					token_type: 'DPoP',
					expires_in: 3600,
					scope: 'atproto',
					sub: TEST_DID,
				}),
			);

			const agent = await createServerAgent({ mockFetch });

			const result = await agent.refresh({
				iss: 'https://auth.example.com',
				sub: TEST_DID as Did,
				aud: 'https://pds.example.com',
				scope: 'atproto',
				access_token: 'old-access',
				refresh_token: 'old-refresh',
				token_type: 'DPoP',
			});

			expect(result.access_token).toBe('new-access-123');
			expect(result.refresh_token).toBe('new-refresh-123');
		});

		it('should throw TokenRefreshError if no refresh token', async () => {
			const agent = await createServerAgent({ mockFetch: vi.fn() });

			await expect(
				agent.refresh({
					iss: 'https://auth.example.com',
					sub: TEST_DID as Did,
					aud: 'https://pds.example.com',
					scope: 'atproto',
					access_token: 'access',
					token_type: 'DPoP',
					// no refresh_token
				}),
			).rejects.toThrow(TokenRefreshError);
		});

		it('should verify issuer before refreshing', async () => {
			const oauthResolver = createMockOAuthResolver({
				issuer: 'https://different-auth.example.com',
			});

			const mockFetch = vi.fn();
			const agent = await createServerAgent({ mockFetch, oauthResolver });

			await expect(
				agent.refresh({
					iss: 'https://auth.example.com',
					sub: TEST_DID as Did,
					aud: 'https://pds.example.com',
					scope: 'atproto',
					access_token: 'access',
					refresh_token: 'refresh',
					token_type: 'DPoP',
				}),
			).rejects.toThrow('issuer mismatch');

			// should NOT have made token request since issuer check failed first
			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe('pushAuthorizationRequest', () => {
		it('should send PAR and return request_uri', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				createMockResponse(200, {
					request_uri: 'urn:ietf:params:oauth:request_uri:abc123',
					expires_in: 60,
				}),
			);

			const agent = await createServerAgent({ mockFetch });

			const result = await agent.pushAuthorizationRequest({
				response_type: 'code',
				redirect_uri: 'https://app.example.com/callback',
				scope: 'atproto',
				code_challenge: 'challenge',
				code_challenge_method: 'S256',
				state: 'state123',
			});

			expect(result.request_uri).toBe('urn:ietf:params:oauth:request_uri:abc123');
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should throw on PAR error', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				createMockResponse(400, {
					error: 'invalid_request',
					error_description: 'bad redirect_uri',
				}),
			);

			const agent = await createServerAgent({ mockFetch });

			await expect(
				agent.pushAuthorizationRequest({
					response_type: 'code',
					redirect_uri: 'https://malicious.example.com/callback',
					scope: 'atproto',
				}),
			).rejects.toThrow(OAuthResponseError);
		});
	});

	describe('revoke', () => {
		it('should revoke token', async () => {
			const mockFetch = vi.fn().mockResolvedValue(createMockResponse(200));

			const agent = await createServerAgent({ mockFetch });

			// should not throw
			await agent.revoke('token-to-revoke');

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should silently ignore revocation errors', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('network error'));

			const agent = await createServerAgent({ mockFetch });

			// should not throw
			await agent.revoke('token-to-revoke');
		});

		it('should skip revocation if no endpoint', async () => {
			const mockFetch = vi.fn();
			const metadata = createMockMetadata();
			delete (metadata as Record<string, unknown>).revocation_endpoint;

			const agent = await createServerAgent({
				mockFetch,
				serverMetadata: metadata,
			});

			await agent.revoke('token');

			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe('issuer property', () => {
		it('should return server issuer', async () => {
			const agent = await createServerAgent({});

			expect(agent.issuer).toBe('https://auth.example.com');
		});
	});
});
