import { describe, expect, it, vi } from 'vitest';

import { Client } from './client.js';
import type { FetchHandler } from './fetch-handler.js';

describe('params serializer', () => {
	const handler = vi.fn<FetchHandler>(() => Promise.resolve(new Response('hello')));
	const rpc = new Client({ handler });

	it('serializes strings', async () => {
		{
			await rpc.get('com.atproto.sync.getBlob', {
				as: 'blob',
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cid: 'bafkreiesgyo7ukzqhs5mmtulvovzrbbru7ztvopwdwfsvllu553qgfmxd4',
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]did=did%3Aplc%3Aia76kvnndjutgedggx2ibrem(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}

		{
			await rpc.get('com.atproto.sync.getBlocks', {
				as: 'blob',
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cids: ['bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq'],
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]cids=bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}

		{
			await rpc.get('com.atproto.sync.getBlocks', {
				as: 'blob',
				params: {
					did: 'did:plc:ia76kvnndjutgedggx2ibrem',
					cids: [
						'bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq',
						'bafyreibyxku6r4rxecexijdmq2v5zogize6giv2ztnrnsx6teu5trmphtq',
					],
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(
					/[?&]cids=bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq&cids=bafyreibyxku6r4rxecexijdmq2v5zogize6giv2ztnrnsx6teu5trmphtq(?:&|$)/,
				),
				expect.objectContaining({ method: 'get' }),
			);
		}
	});

	it('serializes numbers', async () => {
		{
			await rpc.get('com.atproto.repo.listRecords', {
				as: 'bytes',
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					limit: 30,
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]limit=30(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}
	});

	it('serializes booleans', async () => {
		{
			await rpc.get('com.atproto.repo.listRecords', {
				as: 'bytes',
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					reverse: true,
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]reverse=true(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}

		{
			await rpc.get('com.atproto.repo.listRecords', {
				as: 'bytes',
				params: {
					repo: 'did:plc:ia76kvnndjutgedggx2ibrem',
					collection: 'app.bsky.feed.post',
					reverse: false,
				},
			});

			expect(handler).toBeCalledWith(
				expect.stringMatching(/[?&]reverse=false(?:&|$)/),
				expect.objectContaining({ method: 'get' }),
			);
		}
	});
});

describe('proxy', () => {
	it('sets the proxy header', async () => {
		const handler = vi.fn<FetchHandler>(() => Promise.resolve(Response.json({})));
		const rpc = new Client({ handler, proxy: { did: 'did:web:api.bsky.chat', serviceId: '#bsky_chat' } });

		await rpc.get('com.atproto.server.describeServer');

		expect(handler).toBeCalledWith(
			'/xrpc/com.atproto.server.describeServer',
			expect.objectContaining({
				method: 'get',
				headers: new Headers({ 'atproto-proxy': 'did:web:api.bsky.chat#bsky_chat' }),
			}),
		);
	});
});

expect.addEqualityTesters([
	function areURLSearchParamsEqual(a, b) {
		const aIsSearchParams = a instanceof URLSearchParams;
		const bIsSearchParams = b instanceof URLSearchParams;

		if (aIsSearchParams && bIsSearchParams) {
			return false;
		}

		if (aIsSearchParams === bIsSearchParams) {
			return undefined;
		}

		return false;
	},
	function areHeadersEqual(a, b) {
		const aIsHeaders = a instanceof Headers;
		const bIsHeaders = b instanceof Headers;

		if (aIsHeaders && bIsHeaders) {
			return this.equals(Object.fromEntries([...a.entries()]), Object.fromEntries([...b.entries()]));
		}

		if (aIsHeaders === bIsHeaders) {
			return undefined;
		}

		return false;
	},
]);
