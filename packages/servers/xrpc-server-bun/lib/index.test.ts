import { describe, expect, it } from 'bun:test';

import { ComAtprotoLabelDefs, ComAtprotoLabelSubscribeLabels } from '@atcute/atproto';
import { decode, decodeFirst } from '@atcute/cbor';
import { XRPCRouter } from '@atcute/xrpc-server';

import { createBunWebSocket } from './index.js';

const decodeFrame = (buffer: Uint8Array): { header: any; body: any } => {
	const [header, remainder] = decodeFirst(buffer);
	const body = decode(remainder);

	return { header, body };
};

describe('createBunWebSocket', () => {
	it('handles subscription', async () => {
		const ws = createBunWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		const labels: ComAtprotoLabelDefs.Label[] = [
			{
				uri: 'at://did:plc:test/app.bsky.feed.post/123',
				src: 'did:web:example.com',
				val: 'spam',
				cts: '2024-01-01T00:00:00Z',
			},
		];

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					labels: labels,
					seq: 1,
				};
			},
		});

		using server = Bun.serve({
			...ws.wrap(router),
			port: 0,
		});

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);

		const frames: any[] = [];
		await new Promise<void>((resolve, reject) => {
			client.onmessage = (event) => {
				const buffer = event.data;
				const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

				const { header, body } = decodeFrame(uint8);

				frames.push({ header, body });
				resolve();
			};
			client.onerror = () => {
				reject(new Error('WebSocket error'));
			};
		});

		expect(frames).toEqual([
			{
				header: { op: 1, t: '#labels' },
				body: {
					seq: 1,
					labels: [
						{
							cts: '2024-01-01T00:00:00Z',
							src: 'did:web:example.com',
							uri: 'at://did:plc:test/app.bsky.feed.post/123',
							val: 'spam',
						},
					],
				},
			},
		]);

		client.close();
	});

	it('stops sending when client disconnects', async () => {
		const ws = createBunWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		let messageCount = 0;
		let wasAborted = false;

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler({ signal }) {
				while (!signal.aborted) {
					yield {
						$type: 'com.atproto.label.subscribeLabels#labels',
						seq: messageCount++,
						labels: [],
					};

					await new Promise((resolve) => setTimeout(resolve, 10));
				}

				wasAborted = true;
			},
		});

		using server = Bun.serve({
			...ws.wrap(router),
			port: 0,
		});

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);

		const frames: any[] = [];
		await new Promise<void>((resolve, reject) => {
			let receivedCount = 0;

			client.onmessage = (event) => {
				const buffer = event.data;
				const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

				const { header, body } = decodeFrame(uint8);

				frames.push({ header, body });

				receivedCount++;
				if (receivedCount === 2) {
					client.close();
					setTimeout(resolve, 20);
				}
			};
			client.onerror = () => {
				reject(new Error('WebSocket error'));
			};
		});

		expect(wasAborted).toBe(true);
		expect(frames).toEqual([
			{ header: { op: 1, t: '#labels' }, body: { labels: [], seq: 0 } },
			{ header: { op: 1, t: '#labels' }, body: { labels: [], seq: 1 } },
		]);

		client.close();
	});
});
