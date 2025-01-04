import { describe, expect, it, vi } from 'vitest';

import { type FetchHandler } from './fetch-handler.js';
import { clone, withProxy, XRPC, XRPCError } from './rpc.js';

describe('params serializer', () => {
	const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({})));
	const rpc = new XRPC({ handler });

	it('serializes strings', async () => {
		{
			await rpc.get('com.atproto.sync.getBlob', {
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cid: 'bafkreiesgyo7ukzqhs5mmtulvovzrbbru7ztvopwdwfsvllu553qgfmxd4',
				},
			});

			const url = new URL(handler.mock.lastCall![0], 'https://bsky.social');
			expect(url.searchParams.getAll('did')).toEqual(['did:plc:ia76kvnndjutgedggx2ibrem']);
		}

		{
			await rpc.get('com.atproto.sync.getBlocks', {
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cids: ['bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq'],
				},
			});

			const url = new URL(handler.mock.lastCall![0], 'https://bsky.social');
			expect(url.searchParams.getAll('cids')).toEqual([
				'bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq',
			]);
		}

		{
			await rpc.get('com.atproto.sync.getBlocks', {
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cids: [
						'bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq',
						'bafyreibyxku6r4rxecexijdmq2v5zogize6giv2ztnrnsx6teu5trmphtq',
					],
				},
			});

			const url = new URL(handler.mock.lastCall![0], 'https://bsky.social');
			expect(url.searchParams.getAll('cids')).toEqual([
				'bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq',
				'bafyreibyxku6r4rxecexijdmq2v5zogize6giv2ztnrnsx6teu5trmphtq',
			]);
		}
	});

	it('serializes numbers', async () => {
		{
			await rpc.get('com.atproto.repo.listRecords', {
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					limit: 30,
				},
			});

			const url = new URL(handler.mock.lastCall![0], 'https://bsky.social');
			expect(url.searchParams.getAll('limit')).toEqual(['30']);
		}
	});

	it('serializes booleans', async () => {
		{
			await rpc.get('com.atproto.repo.listRecords', {
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					reverse: true,
				},
			});

			const url = new URL(handler.mock.lastCall![0], 'https://bsky.social');
			expect(url.searchParams.getAll('reverse')).toEqual(['true']);
		}

		{
			await rpc.get('com.atproto.repo.listRecords', {
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					reverse: false,
				},
			});

			const url = new URL(handler.mock.lastCall![0], 'https://bsky.social');
			expect(url.searchParams.getAll('reverse')).toEqual(['false']);
		}
	});
});

describe('withProxy()', () => {
	const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({})));
	const rpc = new XRPC({ handler });

	it('sets the proxy header', async () => {
		const chat = withProxy(rpc, { service: 'did:web:api.bsky.chat', type: 'bsky_chat' });

		expect(chat.handle).toBe(rpc.handle);
		expect(chat.proxy).toEqual({ service: 'did:web:api.bsky.chat', type: 'bsky_chat' });

		await chat.get('com.atproto.server.describeServer', {});

		const [, init] = handler.mock.lastCall!;
		expect(init.headers).toEqual(new Headers([['atproto-proxy', 'did:web:api.bsky.chat#bsky_chat']]));
	});
});

describe('clone()', () => {
	const handler = vi.fn<FetchHandler>(async () => Response.json({}));
	const rpc = new XRPC({ handler });

	it('clones the rpc instance', () => {
		const cloned = clone(rpc);

		expect(cloned).not.toBe(rpc);
		expect(cloned.handle).toBe(rpc.handle);
		expect(cloned.proxy).toBe(rpc.proxy);
	});
});

describe('XRPC', () => {
	it('throws InvalidResponse if response cannot be parsed', async () => {
		const handler = vi.fn<FetchHandler>(async () => {
			return new Response('invalid', { headers: { 'content-type': 'application/json' } });
		});

		const rpc = new XRPC({ handler });
		const error = await rpc.get('com.atproto.server.describeServer', {}).then(
			() => null,
			(err) => err,
		);

		expect(error).toBeInstanceOf(XRPCError);

		expect(error.status).toBe(2);
		expect(error).toMatchInlineSnapshot(`[XRPCError: InvalidResponse > Failed to parse response body]`);
	});
});
