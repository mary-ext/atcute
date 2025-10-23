import { describe, expect, it } from 'vitest';

import { serve, type ServerType } from '@hono/node-server';

import { ComAtprotoLabelDefs, ComAtprotoLabelSubscribeLabels } from '@atcute/atproto';
import { decode, decodeFirst } from '@atcute/cbor';
import { XRPCRouter, XRPCSubscriptionError } from '@atcute/xrpc-server';

import { createNodeWebSocket, type NodeWebSocket } from './index.js';

interface Server extends Disposable {
	instance: ServerType;
	port: number;
}

const createHttpServer = async (router: XRPCRouter, ws: NodeWebSocket): Promise<Server> => {
	return new Promise((resolve) => {
		const instance = serve({ port: 0, fetch: router.fetch }, (addr) => {
			ws.injectWebSocket(instance, router);

			resolve({
				instance: instance,
				port: addr.port,
				[Symbol.dispose]() {
					instance.close();
				},
			});
		});
	});
};

const decodeFrame = (buffer: Uint8Array): { header: any; body: any } => {
	const [header, remainder] = decodeFirst(buffer);
	const body = decode(remainder);

	return { header, body };
};

describe('subscriptions', () => {
	it('handles subscription', async () => {
		const ws = createNodeWebSocket();
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

		using server = await createHttpServer(router, ws);

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);
		client.binaryType = 'arraybuffer';

		const frames: any[] = [];
		await new Promise<void>((resolve, reject) => {
			client.onmessage = (event) => {
				const buffer = event.data;
				const uint8 = new Uint8Array(buffer);

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

	it('handles subscription with params', async () => {
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		let receivedCursor: number | undefined;

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler({ params }) {
				receivedCursor = params.cursor;
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					seq: params.cursor ?? 0,
					labels: [],
				};
			},
		});

		using server = await createHttpServer(router, ws);

		const client = new WebSocket(
			`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels?cursor=42`,
		);
		client.binaryType = 'arraybuffer';

		await new Promise<void>((resolve, reject) => {
			client.onmessage = () => {
				resolve();
			};
			client.onerror = () => {
				reject(new Error('WebSocket error'));
			};
		});

		expect(receivedCursor).toBe(42);
		client.close();
	});

	it('handles multiple messages from subscription', async () => {
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					seq: 1,
					labels: [],
				};
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					seq: 2,
					labels: [],
				};
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					seq: 3,
					labels: [],
				};
			},
		});

		using server = await createHttpServer(router, ws);

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);
		client.binaryType = 'arraybuffer';

		const frames: any[] = [];
		await new Promise<void>((resolve, reject) => {
			client.onmessage = (event) => {
				const buffer = event.data;
				const uint8 = new Uint8Array(buffer);

				const { header, body } = decodeFrame(uint8);

				frames.push({ header, body });

				if (frames.length === 3) {
					resolve();
				}
			};
			client.onerror = () => {
				reject(new Error('WebSocket error'));
			};
		});

		expect(frames).toEqual([
			{ header: { op: 1, t: '#labels' }, body: { labels: [], seq: 1 } },
			{ header: { op: 1, t: '#labels' }, body: { labels: [], seq: 2 } },
			{ header: { op: 1, t: '#labels' }, body: { labels: [], seq: 3 } },
		]);

		client.close();
	});

	it('stops sending when client disconnects', async () => {
		const ws = createNodeWebSocket();
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

		using server = await createHttpServer(router, ws);

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);
		client.binaryType = 'arraybuffer';

		const frames: any[] = [];
		await new Promise<void>((resolve, reject) => {
			let receivedCount = 0;

			client.onmessage = (event) => {
				const buffer = event.data;
				const uint8 = new Uint8Array(buffer);

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

	it('sends error frame on XRPCSubscriptionError', async () => {
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					seq: 1,
					labels: [],
				};

				throw new XRPCSubscriptionError({
					error: 'FutureCursor',
					description: `Cursor is in the future`,
				});
			},
		});

		using server = await createHttpServer(router, ws);

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);
		client.binaryType = 'arraybuffer';

		const frames: any[] = [];
		await new Promise<void>((resolve, reject) => {
			client.onmessage = (event) => {
				const buffer = event.data;
				const uint8 = new Uint8Array(buffer);

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
					labels: [],
					seq: 1,
				},
			},
			{
				header: { op: -1 },
				body: {
					error: 'FutureCursor',
					message: 'Cursor is in the future',
				},
			},
		]);

		client.close();
	});

	it('rejects non-WebSocket upgrade requests', async () => {
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					seq: 1,
					labels: [],
				};
			},
		});

		using server = await createHttpServer(router, ws);

		const response = await fetch(`http://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);
		const error = await response.json();

		expect(response.status).toBe(400);
		expect(error).toEqual(expect.objectContaining({ error: 'InvalidRequest' }));
	});
});
