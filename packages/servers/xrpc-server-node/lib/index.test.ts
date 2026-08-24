import * as http from 'node:http';

import { type ComAtprotoLabelDefs, ComAtprotoLabelSubscribeLabels } from '@atcute/atproto';
import { decode, decodeFirst } from '@atcute/cbor';
import * as v from '@atcute/lexicons/validations';
import { InvalidRequestError, XRPCRouter, json } from '@atcute/xrpc-server';

import { createRequestListener } from '@remix-run/node-fetch-server';
import { describe, expect, it } from 'vitest';

import { type NodeWebSocket, createNodeWebSocket } from './index.ts';

// #region test helpers

interface Server extends Disposable {
	instance: http.Server;
	port: number;
	url: string;
}

const createHttpServer = async (router: XRPCRouter, ws?: NodeWebSocket): Promise<Server> => {
	return new Promise((resolve) => {
		const instance = http.createServer(createRequestListener(router.fetch));

		if (ws) {
			ws.injectWebSocket(instance, router);
		}

		instance.listen(0, () => {
			const addr = instance.address() as { port: number };

			resolve({
				instance: instance,
				port: addr.port,
				url: `http://localhost:${addr.port}`,
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

// #endregion

// #region test schemas

const queryNoParams = v.query('com.example.ping', {
	params: null,
	output: null,
});

const queryWithParams = v.query('com.example.greet', {
	params: v.object({
		name: v.string(),
		excited: v.optional(v.boolean()),
	}),
	output: {
		type: 'lex',
		schema: v.object({
			greeting: v.string(),
		}),
	},
});

const procedureNoParams = v.procedure('com.example.noop', {
	params: null,
	input: null,
	output: null,
});

const procedureWithInput = v.procedure('com.example.echo', {
	params: null,
	input: {
		type: 'lex',
		schema: v.object({
			message: v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: v.object({
			echo: v.string(),
		}),
	},
});

const procedureWithParamsAndInput = v.procedure('com.example.create', {
	params: v.object({
		collection: v.string(),
	}),
	input: {
		type: 'lex',
		schema: v.object({
			text: v.string(),
		}),
	},
	output: {
		type: 'lex',
		schema: v.object({
			uri: v.string(),
		}),
	},
});

// #endregion

describe('query', () => {
	it('handles query with no params', async () => {
		const router = new XRPCRouter();
		router.addQuery(queryNoParams, {
			async handler() {},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.ping`);
		expect(response.status).toBe(200);
	});

	it('handles query returning json', async () => {
		const router = new XRPCRouter();
		router.addQuery(queryWithParams, {
			async handler({ params }) {
				const greeting = params.excited ? `HELLO ${params.name}!!!` : `hello ${params.name}`;
				return json({ greeting });
			},
		});

		using server = await createHttpServer(router);

		{
			const response = await fetch(`${server.url}/xrpc/com.example.greet?name=world`);
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ greeting: 'hello world' });
		}

		{
			const response = await fetch(`${server.url}/xrpc/com.example.greet?name=world&excited=true`);
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ greeting: 'HELLO world!!!' });
		}
	});

	it('rejects query with invalid params', async () => {
		const router = new XRPCRouter();
		router.addQuery(queryWithParams, {
			async handler() {
				return json({ greeting: 'unreachable' });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.greet`);
		expect(response.status).toBe(400);

		const body = await response.json();
		expect(body.error).toBe('InvalidRequest');
	});

	it('rejects query with wrong HTTP method', async () => {
		const router = new XRPCRouter();
		router.addQuery(queryNoParams, {
			async handler() {},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.ping`, { method: 'POST' });
		expect(response.status).toBe(405);
	});

	it('returns 404 for undefined routes', async () => {
		const router = new XRPCRouter();

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.nonexistent`);
		expect(response.status).toBe(404);
	});

	it('handles query throwing XRPCError', async () => {
		const router = new XRPCRouter();
		router.addQuery(queryNoParams, {
			async handler() {
				throw new InvalidRequestError({ message: 'something went wrong' });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.ping`);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: 'InvalidRequest',
			message: 'something went wrong',
		});
	});

	it('handles query throwing unexpected error', async () => {
		const router = new XRPCRouter();
		router.addQuery(queryNoParams, {
			async handler() {
				throw new Error('boom');
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.ping`);
		expect(response.status).toBe(500);

		const body = await response.json();
		expect(body.error).toBe('InternalServerError');
	});
});

describe('procedure', () => {
	it('handles procedure with no params or input', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureNoParams, {
			async handler() {},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.noop`, { method: 'POST' });
		expect(response.status).toBe(200);
	});

	it('handles procedure with json input and output', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureWithInput, {
			async handler({ input }) {
				return json({ echo: input.message });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.echo`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ message: 'hello' }),
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ echo: 'hello' });
	});

	it('handles procedure with params and input', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureWithParamsAndInput, {
			async handler({ params, input: _input }) {
				return json({ uri: `at://did:plc:test/${params.collection}/abc` });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.create?collection=app.bsky.feed.post`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: 'hello world' }),
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			uri: 'at://did:plc:test/app.bsky.feed.post/abc',
		});
	});

	it('rejects procedure with missing required input', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureWithInput, {
			async handler({ input }) {
				return json({ echo: input.message });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.echo`, { method: 'POST' });
		expect(response.status).toBe(400);

		const body = await response.json();
		expect(body.error).toBe('InvalidRequest');
	});

	it('rejects procedure with wrong content type', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureWithInput, {
			async handler({ input }) {
				return json({ echo: input.message });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.echo`, {
			method: 'POST',
			headers: { 'content-type': 'text/plain' },
			body: JSON.stringify({ message: 'hello' }),
		});

		expect(response.status).toBe(400);

		const body = await response.json();
		expect(body.error).toBe('InvalidRequest');
	});

	it('rejects procedure with wrong HTTP method', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureNoParams, {
			async handler() {},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.noop`, { method: 'GET' });
		expect(response.status).toBe(405);
	});

	it('rejects procedure with invalid input schema', async () => {
		const router = new XRPCRouter();
		router.addProcedure(procedureWithInput, {
			async handler({ input }) {
				return json({ echo: input.message });
			},
		});

		using server = await createHttpServer(router);

		const response = await fetch(`${server.url}/xrpc/com.example.echo`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ message: 123 }),
		});

		expect(response.status).toBe(400);

		const body = await response.json();
		expect(body.error).toBe('InvalidRequest');
	});
});

describe('subscription', () => {
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

	it('flushes synchronous subscription output before closing', async () => {
		const messageCount = 512;
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {
				for (let seq = 0; seq < messageCount; seq++) {
					yield {
						$type: 'com.atproto.label.subscribeLabels#labels',
						labels: [],
						seq: seq,
					};
				}
			},
		});

		using server = await createHttpServer(router, ws);

		const client = new WebSocket(`ws://localhost:${server.port}/xrpc/com.atproto.label.subscribeLabels`);
		client.binaryType = 'arraybuffer';

		const sequences: number[] = [];
		await new Promise<void>((resolve, reject) => {
			client.onclose = () => {
				resolve();
			};
			client.onerror = () => {
				reject(new Error('WebSocket error'));
			};
			client.onmessage = (event) => {
				const { body } = decodeFrame(new Uint8Array(event.data));
				sequences.push(body.seq);
			};
		});

		expect(sequences).toEqual(Array.from({ length: messageCount }, (_, index) => index));
	});

	it('does not interfere with non-xrpc upgrade requests', async () => {
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {},
		});

		const instance = http.createServer(createRequestListener(router.fetch));
		ws.injectWebSocket(instance, router);

		let coexistingHandlerSawRequest = false;
		instance.on('upgrade', (request, socket) => {
			if (request.url?.startsWith('/xrpc/')) {
				return;
			}

			// pretend to be vite hmr / adonis ws / etc. — handle the upgrade ourselves
			coexistingHandlerSawRequest = true;
			socket.destroy();
		});

		await new Promise<void>((resolve) => instance.listen(0, () => resolve()));
		const port = (instance.address() as { port: number }).port;

		try {
			const client = new WebSocket(`ws://localhost:${port}/some-other-path`);
			await new Promise<void>((resolve) => {
				client.onerror = () => resolve();
				client.onclose = () => resolve();
			});
		} finally {
			instance.close();
		}

		expect(coexistingHandlerSawRequest).toBe(true);
	});

	it('allows callers to wrap the listener returned by createUpgradeListener', async () => {
		const ws = createNodeWebSocket();
		const router = new XRPCRouter({ websocket: ws.adapter });

		router.addSubscription(ComAtprotoLabelSubscribeLabels.mainSchema, {
			async *handler() {
				yield {
					$type: 'com.atproto.label.subscribeLabels#labels',
					labels: [],
					seq: 1,
				};
			},
		});

		const listener = ws.createUpgradeListener(router);
		let wrappedCount = 0;

		const instance = http.createServer(createRequestListener(router.fetch));
		instance.on('upgrade', (request, socket, head) => {
			if (!request.url?.startsWith('/xrpc/')) {
				return;
			}

			wrappedCount++;
			listener(request, socket, head);
		});

		await new Promise<void>((resolve) => instance.listen(0, () => resolve()));
		const port = (instance.address() as { port: number }).port;

		try {
			const client = new WebSocket(`ws://localhost:${port}/xrpc/com.atproto.label.subscribeLabels`);
			client.binaryType = 'arraybuffer';

			await new Promise<void>((resolve, reject) => {
				client.onmessage = () => resolve();
				client.onerror = () => reject(new Error('WebSocket error'));
			});

			client.close();
		} finally {
			instance.close();
		}

		expect(wrappedCount).toBe(1);
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
});
