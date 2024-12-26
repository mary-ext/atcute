import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { TestNetwork } from '@atcute/internal-dev-env';

import { clone, withProxy } from './rpc.js';
import { simpleFetchHandler } from './fetch-handler.js';
import { XRPC } from './rpc.js';

let network: TestNetwork;

beforeAll(async () => {
	network = await TestNetwork.create({});
});

afterAll(async () => {
	await network.close();
});

describe('XRPC', () => {
	it('appends parameters to request', async () => {
		const fetch = vi.fn(globalThis.fetch);
		const handler = simpleFetchHandler({
			service: network.pds.url,
			fetch,
		});
		const rpc = new XRPC({ handler });

		fetch.mockResolvedValueOnce(
			new Response('{}', {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		);

		await rpc.get('com.atproto.admin.getAccountInfo', {
			params: {
				did: 'did:bleepbloop',
			},
		});

		const lastURL = fetch.mock.lastCall![0] as URL;

		expect(lastURL.search).to.equal('?did=did%3Ableepbloop');
	});

	it('stringifies non-string parameters', async () => {
		const fetch = vi.fn(globalThis.fetch);
		const handler = simpleFetchHandler({
			service: network.pds.url,
			fetch,
		});
		const rpc = new XRPC({ handler });

		fetch.mockResolvedValueOnce(
			new Response('{}', {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		);

		await rpc.get('com.atproto.admin.getInviteCodes', {
			params: {
				limit: 200,
			},
		});

		const lastURL = fetch.mock.lastCall![0] as URL;

		expect(lastURL.search).to.equal('?limit=200');
	});

	it('stringifies array parameters', async () => {
		const fetch = vi.fn(globalThis.fetch);
		const handler = simpleFetchHandler({
			service: network.pds.url,
			fetch,
		});
		const rpc = new XRPC({ handler });

		fetch.mockResolvedValueOnce(
			new Response('{}', {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		);

		await rpc.get('com.atproto.label.queryLabels', {
			params: {
				uriPatterns: ['a', 'b'],
			},
		});

		const lastURL = fetch.mock.lastCall![0] as URL;

		expect(lastURL.search).to.equal('?uriPatterns=a&uriPatterns=b');
	});
});

describe('clone', () => {
	it('clones an XRPC instance', async () => {
		const fetch = vi.fn(globalThis.fetch);
		const handler = simpleFetchHandler({
			service: network.pds.url,
			fetch,
		});
		const rpc = new XRPC({ handler });
		const rpcClone = clone(rpc);

		await rpc.get('com.atproto.server.describeServer', {});
		await rpcClone.get('com.atproto.server.describeServer', {});

		expect(rpc).not.toBe(rpcClone);
		expect(fetch).toBeCalledTimes(2);
	});
});

describe('withProxy', () => {
	it('clones an XRPC instance and adds proxy', async () => {
		const handler = simpleFetchHandler({
			service: network.pds.url,
			fetch,
		});
		const rpc = new XRPC({ handler });
		const rpcClone = withProxy(rpc, {
			service: 'did:dod',
			type: 'atproto_labeler',
		});

		expect(rpc).not.toBe(rpcClone);
		expect(rpcClone.proxy).toEqual({
			service: 'did:dod',
			type: 'atproto_labeler',
		});
	});
});
