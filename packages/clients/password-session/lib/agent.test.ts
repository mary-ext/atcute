import { Client, ok, simpleFetchHandler } from '@atcute/client';
import { TestNetwork } from '@atcute/internal-dev-env';
import type { Handle } from '@atcute/lexicons';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { PasswordSession, type PasswordSessionData } from './password-session.ts';

let network: TestNetwork;

beforeAll(async () => {
	network = await TestNetwork.create({});

	const rpc = new Client({ handler: simpleFetchHandler({ service: network.pds.url }) });
	await createAccount(rpc, 'user1.test');
});

afterAll(async () => {
	await network.close();
});

it('can connect to a PDS', async () => {
	const rpc = new Client({ handler: simpleFetchHandler({ service: network.pds.url }) });

	const data = await ok(rpc.get('com.atproto.server.describeServer'));

	expect(data).toEqual({
		did: 'did:web:localhost',
		availableUserDomains: ['.test', '.example'],
		inviteCodeRequired: false,
		links: {
			privacyPolicy: 'https://bsky.social/about/support/privacy-policy',
			termsOfService: 'https://bsky.social/about/support/tos',
		},
		contact: {},
	});
});

describe('PasswordSession', () => {
	it('can login via static factory', async () => {
		const onUpdate = vi.fn();

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ onUpdate },
		);
		const rpc = new Client({ handler: session });

		expect(onUpdate).toHaveBeenCalledOnce();
		expect(session.destroyed).toBe(false);
		expect(session.session).not.toBe(undefined);

		await expect(ok(rpc.get('com.atproto.server.getSession'))).resolves.not.toBe(undefined);
	});

	it('can login with URL shorthand', async () => {
		const url = new URL(network.pds.url);
		url.username = 'user1.test';
		url.password = 'password';

		const session = await PasswordSession.login(url.href);
		const rpc = new Client({ handler: session });

		expect(session.destroyed).toBe(false);
		await expect(ok(rpc.get('com.atproto.server.getSession'))).resolves.not.toBe(undefined);
	});

	it('can login with cached session fallback', async () => {
		// first, get a valid session
		const initial = await PasswordSession.login({
			service: network.pds.url,
			identifier: 'user1.test',
			password: 'password',
		});
		const cachedSession = initial.session;

		const fetch = vi.fn(globalThis.fetch);

		// login with cached session — should resume instead of creating new session
		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ session: cachedSession, fetch },
		);

		expect(session.destroyed).toBe(false);

		// should have used getSession (from resume) not createSession
		const calls = fetch.mock.calls.map(([input]) => new Request(input).url);
		const hasCreate = calls.some((url) => url.includes('createSession'));
		expect(hasCreate).toBe(false);
	});

	it('falls back to fresh login when cached session is invalid', async () => {
		const invalidSession: PasswordSessionData = {
			service: network.pds.url,
			accessJwt: 'invalid',
			refreshJwt: 'invalid',
			handle: 'user1.test',
			did: 'did:plc:fake',
			active: true,
		};

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ session: invalidSession },
		);

		expect(session.destroyed).toBe(false);
		const rpc = new Client({ handler: session });
		await expect(ok(rpc.get('com.atproto.server.getSession'))).resolves.not.toBe(undefined);
	});

	it('refreshes on 401', async () => {
		const fetch = vi.fn(globalThis.fetch);
		const onUpdate = vi.fn();

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ fetch, onUpdate },
		);
		const rpc = new Client({ handler: session });

		onUpdate.mockClear();

		const originalJwt = session.session.accessJwt;

		// refreshing now would return the same token due to matching timestamp
		await sleep(1_000);

		fetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: 'ExpiredToken' }), {
				status: 400,
				headers: { 'content-type': 'application/json' },
			}),
		);

		await ok(rpc.get('com.atproto.server.getSession'));
		expect(onUpdate).toHaveBeenCalledOnce();

		const refreshedJwt = session.session.accessJwt;
		expect(refreshedJwt).not.toBe(originalJwt);
	});

	it('deduplicates token refreshes', async () => {
		const originalFetch = globalThis.fetch;
		const fetch = vi.fn(globalThis.fetch);
		const onUpdate = vi.fn();

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ fetch, onUpdate },
		);
		const rpc = new Client({ handler: session });

		onUpdate.mockClear();

		const originalJwt = session.session.accessJwt;

		await sleep(1_000);

		let expiredCalls = 0;
		let refreshCalls = 0;

		await fetch.withImplementation(
			(input, init) => {
				const request = new Request(input, init);

				if (request.headers.get('authorization') === `Bearer ${originalJwt}`) {
					expiredCalls++;

					return Promise.resolve(
						new Response(JSON.stringify({ error: 'ExpiredToken' }), {
							status: 400,
							headers: { 'content-type': 'application/json' },
						}),
					);
				}

				if (request.url.includes('/xrpc/com.atproto.server.refreshSession')) {
					refreshCalls++;
				}

				return originalFetch(request);
			},
			async () => {
				await Promise.all([
					ok(rpc.get('com.atproto.server.getSession')),
					ok(rpc.get('com.atproto.server.getSession')),
					ok(rpc.get('com.atproto.server.getSession')),
				]);
			},
		);

		expect(expiredCalls).toBe(3);
		expect(refreshCalls).toBe(1);

		expect(onUpdate).toHaveBeenCalledOnce();

		const refreshedJwt = session.session.accessJwt;
		expect(refreshedJwt).not.toBe(originalJwt);
	});

	it('preserves session on transient refresh failure', async () => {
		const originalFetch = globalThis.fetch;
		const fetch = vi.fn(globalThis.fetch);
		const onUpdate = vi.fn();
		const onUpdateFailure = vi.fn();

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ fetch, onUpdate, onUpdateFailure },
		);
		const rpc = new Client({ handler: session });

		onUpdate.mockClear();

		const originalJwt = session.session.accessJwt;

		await sleep(1_000);

		await fetch.withImplementation(
			(input, init) => {
				const request = new Request(input, init);

				if (request.headers.get('authorization') === `Bearer ${originalJwt}`) {
					return Promise.resolve(
						new Response(JSON.stringify({ error: 'ExpiredToken' }), {
							status: 400,
							headers: { 'content-type': 'application/json' },
						}),
					);
				}

				if (request.url.includes('/xrpc/com.atproto.server.refreshSession')) {
					return Promise.resolve(new Response(undefined, { status: 500 }));
				}

				return originalFetch(request);
			},
			async () => {
				const response = await rpc.get('com.atproto.server.getSession');

				if (response.ok) {
					expect.fail('getSession call should not succeed');
				}

				expect(response.data.error).toBe('ExpiredToken');
			},
		);

		expect(session.destroyed).toBe(false);
		expect(session.session.accessJwt).toBe(originalJwt);

		expect(onUpdate).not.toHaveBeenCalled();
		expect(onUpdateFailure).toHaveBeenCalledOnce();
	});

	it('can resume sessions (quick path)', async () => {
		let savedSession: PasswordSessionData;

		{
			const session = await PasswordSession.login({
				service: network.pds.url,
				identifier: 'user1.test',
				password: 'password',
			});
			savedSession = session.session;
		}

		const fetch = vi.fn(globalThis.fetch);
		expect(fetch).not.toHaveBeenCalled();

		{
			const session = await PasswordSession.resume(savedSession, { fetch });
			expect(session.destroyed).toBe(false);
		}

		expect(fetch).toHaveBeenCalledOnce();
		expect(fetch.mock.lastCall).not.toBe(undefined);

		{
			const lastCall = fetch.mock.lastCall!;
			const request = new Request(lastCall[0], lastCall[1]);

			expect(request.url).includes('/xrpc/com.atproto.server.getSession');
		}
	});

	it('can logout', async () => {
		const onDelete = vi.fn();

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ onDelete },
		);

		expect(session.destroyed).toBe(false);

		await session.logout();

		expect(session.destroyed).toBe(true);
		expect(onDelete).toHaveBeenCalledOnce();

		expect(() => session.session).toThrow();
		expect(() => session.did).toThrow();
	});

	it('preserves session on logout network failure', async () => {
		const originalFetch = globalThis.fetch;
		const fetch = vi.fn(globalThis.fetch);
		const onDelete = vi.fn();
		const onDeleteFailure = vi.fn();

		const session = await PasswordSession.login(
			{ service: network.pds.url, identifier: 'user1.test', password: 'password' },
			{ fetch, onDelete, onDeleteFailure },
		);

		await fetch.withImplementation(
			(input, init) => {
				const request = new Request(input, init);

				if (request.url.includes('/xrpc/com.atproto.server.deleteSession')) {
					return Promise.resolve(new Response(undefined, { status: 500 }));
				}

				return originalFetch(request);
			},
			async () => {
				await expect(session.logout()).rejects.toThrow();
			},
		);

		expect(session.destroyed).toBe(false);
		expect(onDelete).not.toHaveBeenCalled();
		expect(onDeleteFailure).toHaveBeenCalledOnce();
	});

	it('can delete session without resuming', async () => {
		const session = await PasswordSession.login({
			service: network.pds.url,
			identifier: 'user1.test',
			password: 'password',
		});
		const savedSession = session.session;

		await PasswordSession.delete(savedSession);
	});
});

const createAccount = async (rpc: Client, handle: Handle) => {
	await ok(
		rpc.post('com.atproto.server.createAccount', {
			input: {
				handle: handle,
				email: `user@test.com`,
				password: `password`,
			},
		}),
	);
};

const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
