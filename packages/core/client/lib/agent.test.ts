import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TestNetwork } from '@atcute/internal-dev-env';

import { XRPC } from './index.js';
import { AtpAuth } from './middlewares/auth.js';

let network: TestNetwork;

beforeEach(async () => {
	network = await TestNetwork.create({});
});

afterEach(async () => {
	await network.close();
});

it('can connect to a PDS', async () => {
	const rpc = new XRPC({ service: network.pds.url });

	const { data } = await rpc.get('com.atproto.server.describeServer', {});

	expect(data).toEqual({
		did: 'did:web:localhost',
		availableUserDomains: ['.test'],
		inviteCodeRequired: false,
		links: {
			privacyPolicy: 'https://bsky.social/about/support/privacy-policy',
			termsOfService: 'https://bsky.social/about/support/tos',
		},
		contact: {},
	});
});

describe('AtpAuth', () => {
	beforeEach(async () => {
		const rpc = new XRPC({ service: network.pds.url });
		await createAccount(rpc, 'user1.test');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('can login', async () => {
		const onSessionUpdate = vi.fn();

		const rpc = new XRPC({ service: network.pds.url });
		const auth = new AtpAuth(rpc, { onSessionUpdate: onSessionUpdate });

		await expect(rpc.get('com.atproto.server.getSession', {})).rejects.toThrow();
		expect(onSessionUpdate).not.toHaveBeenCalled();
		expect(auth.session).toBe(undefined);

		await auth.login({ identifier: 'user1.test', password: 'password' });

		await expect(rpc.get('com.atproto.server.getSession', {})).resolves.not.toBe(undefined);
		expect(onSessionUpdate).toHaveBeenCalledOnce();
		expect(auth.session).not.toBe(undefined);
	});

	it('can refresh for new tokens', async () => {
		const fetch = vi.spyOn(globalThis, 'fetch');
		const onRefresh = vi.fn();

		const rpc = new XRPC({ service: network.pds.url });
		const auth = new AtpAuth(rpc, { onRefresh: onRefresh });

		await auth.login({ identifier: 'user1.test', password: 'password' });
		expect(onRefresh).not.toHaveBeenCalled();

		const originalJwt = auth.session!.accessJwt;

		// Refreshing now would return the same token due to matching timestamp,
		// wait for 1 second.
		await sleep(1_000);

		fetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: 'ExpiredToken' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		await rpc.get('com.atproto.server.getSession', {});
		expect(onRefresh).toHaveBeenCalledOnce();

		const refreshedJwt = auth.session!.accessJwt;

		expect(refreshedJwt).not.toBe(originalJwt);
	});

	it('dedupes token refreshes', async () => {
		const originalFetch = globalThis.fetch;

		const fetch = vi.spyOn(globalThis, 'fetch');
		const onRefresh = vi.fn();

		const rpc = new XRPC({ service: network.pds.url });
		const auth = new AtpAuth(rpc, { onRefresh: onRefresh });

		await auth.login({ identifier: 'user1.test', password: 'password' });

		const originalJwt = auth.session!.accessJwt;

		// Refreshing now would return the same token due to matching timestamp,
		// wait for 1 second.
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
							headers: { 'Content-Type': 'application/json' },
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
					rpc.get('com.atproto.server.getSession', {}),
					rpc.get('com.atproto.server.getSession', {}),
					rpc.get('com.atproto.server.getSession', {}),
				]);
			},
		);

		expect(expiredCalls).toBe(3);
		expect(refreshCalls).toBe(1);

		expect(onRefresh).toHaveBeenCalledOnce();

		const refreshedJwt = auth.session!.accessJwt;

		expect(refreshedJwt).not.toBe(originalJwt);
	});
});

const createAccount = async (rpc: XRPC, handle: string) => {
	await rpc.call('com.atproto.server.createAccount', {
		data: {
			handle: handle,
			email: `user@test.com`,
			password: `password`,
		},
	});
};

const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
