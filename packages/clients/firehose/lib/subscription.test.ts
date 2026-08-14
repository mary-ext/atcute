import { ComAtprotoSyncSubscribeRepos } from '@atcute/atproto';
import { encode } from '@atcute/cbor';
import {
	type XRPCSubprotocol,
	integer,
	literal,
	object,
	optional,
	subscription,
} from '@atcute/lexicons/validations';
import { concat } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';
import { type ServerOptions, type WebSocket, WebSocketServer } from 'ws';

import { FirehoseSubscription } from './subscription.ts';

const messageSchema = object({
	$type: optional(literal('com.example.subscribeEvents#event')),
	value: integer(),
});

const startServer = (options?: Omit<ServerOptions, 'port'>) => {
	const server = new WebSocketServer({ ...options, port: 0 });
	const address = server.address();
	if (typeof address === 'string' || address === null) {
		throw new Error(`unexpected ws address`);
	}

	return {
		server,
		url: `ws://127.0.0.1:${address.port}`,
		close: () => new Promise<void>((resolve) => server.close(() => resolve())),
	};
};

const receiveFrame = async ({
	frame,
	optionsSubprotocol,
	selectedSubprotocol,
	schemaSubprotocol,
}: {
	frame: Uint8Array | string;
	optionsSubprotocol?: XRPCSubprotocol;
	selectedSubprotocol: false | string;
	schemaSubprotocol?: XRPCSubprotocol;
}) => {
	let offeredSubprotocols: string[] = [];
	const { server, url, close } = startServer({
		handleProtocols(protocols) {
			offeredSubprotocols = [...protocols];
			return selectedSubprotocol;
		},
	});

	server.on('connection', (socket: WebSocket) => {
		socket.send(frame);
	});

	const nsid = subscription('com.example.subscribeEvents', {
		message: messageSchema,
		params: null,
		subprotocol: schemaSubprotocol,
	});
	const subscriptionClient = new FirehoseSubscription({
		service: url,
		nsid,
		subprotocol: optionsSubprotocol,
	});
	const iterator = subscriptionClient[Symbol.asyncIterator]();

	try {
		const result = await iterator.next();
		return { offeredSubprotocols, result };
	} finally {
		await iterator.return?.();
		await close();
	}
};

describe('firehose subscription', () => {
	it('offers and uses xrpc.v1.json for a declared v1 subscription', async () => {
		const payload = {
			$type: 'com.example.subscribeEvents#event',
			value: 42,
		};
		const { offeredSubprotocols, result } = await receiveFrame({
			frame: JSON.stringify({ $type: 'message', payload }),
			selectedSubprotocol: 'xrpc.v1.json',
			schemaSubprotocol: 'xrpc.v1.json',
		});

		expect(offeredSubprotocols).toEqual(['xrpc.v1.json']);
		expect(result).toEqual({ done: false, value: payload });
	});

	it('uses unnegotiated xrpc.v0.cbor framing for legacy subscriptions', async () => {
		const { offeredSubprotocols, result } = await receiveFrame({
			frame: concat([encode({ op: 1, t: '#event' }), encode({ value: 42 })]),
			selectedSubprotocol: false,
		});

		expect(offeredSubprotocols).toEqual([]);
		expect(result).toEqual({
			done: false,
			value: {
				$type: 'com.example.subscribeEvents#event',
				value: 42,
			},
		});
	});

	it('allows the schema subprotocol to be overridden', async () => {
		const payload = {
			$type: 'com.example.subscribeEvents#event',
			value: 42,
		};
		const { offeredSubprotocols, result } = await receiveFrame({
			frame: encode({ $type: 'message', payload }),
			optionsSubprotocol: 'xrpc.v1.cbor',
			selectedSubprotocol: 'xrpc.v1.cbor',
			schemaSubprotocol: 'xrpc.v1.json',
		});

		expect(offeredSubprotocols).toEqual(['xrpc.v1.cbor']);
		expect(result).toEqual({ done: false, value: payload });
	});

	it('never opens when the server declines the requested subprotocol', async () => {
		const { url, close } = startServer({ handleProtocols: () => false });

		let opens = 0;
		let connectionErrors = 0;

		const nsid = subscription('com.example.subscribeEvents', {
			message: messageSchema,
			params: null,
		});
		const subscriptionClient = new FirehoseSubscription({
			service: url,
			nsid,
			subprotocol: 'xrpc.v1.json',
			ws: { maxRetries: 0 },
			onConnectionOpen: () => {
				opens++;
			},
			onConnectionError: () => {
				connectionErrors++;
			},
		});

		const iterator = subscriptionClient[Symbol.asyncIterator]();
		await new Promise((resolve) => setTimeout(resolve, 75));
		await iterator.return?.();

		await close();
		expect(opens).toBe(0);
		expect(connectionErrors).toBeGreaterThan(0);
	});

	it('routes malformed frames to onError instead of throwing', async () => {
		const { server, url, close } = startServer();

		let errors = 0;

		server.on('connection', (socket: WebSocket) => {
			// not a valid CBOR frame header (decodes to the integer 1)
			socket.send(new Uint8Array([0x01]));
			setTimeout(() => socket.close(), 25);
		});

		const subscriptionClient = new FirehoseSubscription({
			service: url,
			nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
			onError: () => {
				errors++;
			},
		});

		const iterator = subscriptionClient[Symbol.asyncIterator]();
		await new Promise((resolve) => setTimeout(resolve, 75));
		await iterator.return?.();

		await close();
		expect(errors).toBeGreaterThan(0);
	});

	it('serializes array params as repeated keys', async () => {
		const { server, url, close } = startServer();

		let requestUrl: string | undefined;

		server.on('connection', (socket: WebSocket, request) => {
			requestUrl = request.url;
			setTimeout(() => socket.close(), 25);
		});

		const subscriptionClient = new FirehoseSubscription({
			service: url,
			nsid: ComAtprotoSyncSubscribeRepos.mainSchema,
			// subscribeRepos has no array params; exercise serialization directly
			params: { wantedCollections: ['app.bsky.feed.post', 'app.bsky.feed.like'] } as never,
		});

		const iterator = subscriptionClient[Symbol.asyncIterator]();
		await new Promise((resolve) => setTimeout(resolve, 75));
		await iterator.return?.();

		await close();

		const query = new URL(requestUrl!, 'ws://127.0.0.1').searchParams;
		expect(query.getAll('wantedCollections')).toEqual(['app.bsky.feed.post', 'app.bsky.feed.like']);
	});
});
