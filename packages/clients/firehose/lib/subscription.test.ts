import { ComAtprotoSyncSubscribeRepos } from '@atcute/atproto';

import { describe, expect, it } from 'vitest';
import { type WebSocket, WebSocketServer } from 'ws';

import { FirehoseSubscription } from './subscription.ts';

describe('firehose subscription', () => {
	it('routes malformed frames to onError instead of throwing', async () => {
		const server = new WebSocketServer({ port: 0 });
		const address = server.address();
		if (typeof address === 'string' || address === null) {
			throw new Error(`unexpected ws address`);
		}

		let errors = 0;

		server.on('connection', (socket: WebSocket) => {
			// not a valid CBOR frame header (decodes to the integer 1)
			socket.send(new Uint8Array([0x01]));
			setTimeout(() => socket.close(), 25);
		});

		const subscription = new FirehoseSubscription({
			service: `ws://127.0.0.1:${address.port}`,
			nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
			onError: () => {
				errors++;
			},
		});

		const iterator = subscription[Symbol.asyncIterator]();
		await new Promise((resolve) => setTimeout(resolve, 75));
		await iterator.return?.();

		await new Promise<void>((resolve) => server.close(() => resolve()));
		expect(errors).toBeGreaterThan(0);
	});

	it('serializes array params as repeated keys', async () => {
		const server = new WebSocketServer({ port: 0 });
		const address = server.address();
		if (typeof address === 'string' || address === null) {
			throw new Error(`unexpected ws address`);
		}

		let requestUrl: string | undefined;

		server.on('connection', (socket: WebSocket, request) => {
			requestUrl = request.url;
			setTimeout(() => socket.close(), 25);
		});

		const subscription = new FirehoseSubscription({
			service: `ws://127.0.0.1:${address.port}`,
			nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
			// subscribeRepos has no array params; exercise serialization directly
			params: { wantedCollections: ['app.bsky.feed.post', 'app.bsky.feed.like'] } as never,
		});

		const iterator = subscription[Symbol.asyncIterator]();
		await new Promise((resolve) => setTimeout(resolve, 75));
		await iterator.return?.();

		await new Promise<void>((resolve) => server.close(() => resolve()));

		const query = new URL(requestUrl!, 'ws://127.0.0.1').searchParams;
		expect(query.getAll('wantedCollections')).toEqual(['app.bsky.feed.post', 'app.bsky.feed.like']);
	});
});
