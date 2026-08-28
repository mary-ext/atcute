import type { IncomingMessage } from 'node:http';

import { FirehoseError } from '@atcute/firehose';

import { describe, expect, it } from 'vitest';
import { type WebSocket, WebSocketServer } from 'ws';

import type { CursorStore } from './cursor.ts';
import { type SubscribeEventsMessage, subscribeEvents } from './subscribe-events.ts';

const WS_OPTIONS = { minReconnectionDelay: 10, maxReconnectionDelay: 20, minUptime: 10 };

const startServer = (onConnection: (socket: WebSocket, index: number) => void) => {
	const server = new WebSocketServer({
		port: 0,
		handleProtocols: (protocols) => (protocols.has('xrpc.v1.json') ? 'xrpc.v1.json' : false),
	});

	const address = server.address();
	if (typeof address === 'string' || address === null) {
		throw new Error(`unexpected ws address`);
	}

	const requests: URLSearchParams[] = [];

	server.on('connection', (socket: WebSocket, request: IncomingMessage) => {
		const index = requests.length;
		requests.push(new URL(request.url!, 'ws://127.0.0.1').searchParams);

		onConnection(socket, index);
	});

	return {
		requests,
		service: `ws://127.0.0.1:${address.port}`,
		close: () => new Promise<void>((resolve) => server.close(() => resolve())),
	};
};

const messageFrame = (payload: Record<string, unknown>): string => {
	return JSON.stringify({ $type: 'message', payload: payload });
};

const commitFrame = (seq: number): string => {
	return messageFrame({
		$type: 'network.bsky.jetstream.subscribeEvents#commit',
		seq,
		did: 'did:plc:eygmaihciaxprqvxpfvl6flk',
		time: '2024-09-09T19:46:02.329308Z',
		rev: '3l3qo2vutsw2b',
		operation: 'create',
		collection: 'app.bsky.feed.like',
		rkey: '3l3qo2vuowo2b',
		cid: 'bafyreidwaivazkwu67xztlmuobx35hs2lnfh3kolmgfmucldvhd3sgzcqi',
		record: { $type: 'app.bsky.feed.like', createdAt: '2024-09-09T19:46:02.102Z' },
	});
};

const infoFrame = (): string => {
	return messageFrame({
		$type: 'network.bsky.jetstream.subscribeEvents#info',
		name: 'OutdatedCursor',
	});
};

const errorFrame = (error: string): string => {
	return JSON.stringify({ $type: 'error', error, message: 'go away' });
};

const perConnection = (batches: string[][]) => {
	return (socket: WebSocket, index: number) => {
		for (const frame of batches[index] ?? []) {
			socket.send(frame);
		}

		if (index < batches.length - 1) {
			setTimeout(() => socket.close(), 30);
		}
	};
};

const take = async (stream: AsyncIterable<SubscribeEventsMessage>, count: number) => {
	const received: SubscribeEventsMessage[] = [];

	for await (const message of stream) {
		received.push(message);

		if (received.length === count) {
			break;
		}
	}

	return received;
};

const spyCursorStore = (initialSeq?: number) => {
	const saves: number[] = [];

	const store: CursorStore = {
		load: () => initialSeq,
		save: (seq) => void saves.push(seq),
	};

	return { saves, store };
};

describe('subscribeEvents', () => {
	it('drops the events redelivered by inclusive replay', async () => {
		const { service, close } = startServer((socket) => {
			for (const seq of [1, 2, 2, 1, 3]) {
				socket.send(commitFrame(seq));
			}
		});

		const stream = subscribeEvents({ service, ws: WS_OPTIONS });
		const received = await take(stream, 3);

		await close();
		expect(received.map((message) => message.seq)).toEqual([1, 2, 3]);
	});

	it('omits the cursor until an event arrives, then resumes from it', async () => {
		const { requests, service, close } = startServer(perConnection([[], [commitFrame(7)], [commitFrame(8)]]));

		const stream = subscribeEvents({ service, ws: WS_OPTIONS });
		const received = await take(stream, 2);

		await close();
		expect(received.map((message) => message.seq)).toEqual([7, 8]);
		expect(requests.map((params) => params.get('cursor'))).toEqual([null, null, '7']);
	});

	it('routes info advisories to onInfo without delivering them', async () => {
		const { service, close } = startServer((socket) => {
			socket.send(infoFrame());
			socket.send(commitFrame(4));
		});

		const infos: string[] = [];

		const stream = subscribeEvents({
			service,
			ws: WS_OPTIONS,
			onInfo: (info) => void infos.push(info.name),
		});
		const received = await take(stream, 1);

		await close();
		expect(infos).toEqual(['OutdatedCursor']);
		expect(received.map((message) => message.seq)).toEqual([4]);
	});

	it('skips frames from a newer lexicon without moving the cursor', async () => {
		const { requests, service, close } = startServer(
			perConnection([
				[messageFrame({ $type: 'network.bsky.jetstream.subscribeEvents#future', seq: 99 })],
				[commitFrame(2)],
			]),
		);

		const stream = subscribeEvents({ service, ws: WS_OPTIONS });
		const received = await take(stream, 1);

		await close();
		expect(received.map((message) => message.seq)).toEqual([2]);
		expect(requests.map((params) => params.get('cursor'))).toEqual([null, null]);
	});

	it('resumes from the cursor store, throttles saves, and flushes on exit', async () => {
		const { requests, service, close } = startServer((socket) => {
			for (const seq of [13, 14, 15]) {
				socket.send(commitFrame(seq));
			}
		});

		const { saves, store } = spyCursorStore(12);

		const stream = subscribeEvents({
			service,
			cursor: store,
			cursorSaveInterval: 60_000,
			ws: WS_OPTIONS,
		});
		const received = await take(stream, 3);

		await close();
		expect(received.map((message) => message.seq)).toEqual([13, 14, 15]);
		expect(requests[0].get('cursor')).toBe('12');
		// the final cursor update requires another iteration
		expect(saves).toEqual([13, 14]);
	});

	it('treats a sequence number as a cursor store', async () => {
		const { requests, service, close } = startServer(perConnection([[commitFrame(9)], [commitFrame(10)]]));

		const stream = subscribeEvents({ service, cursor: 5, ws: WS_OPTIONS });
		const received = await take(stream, 2);

		await close();
		expect(received.map((message) => message.seq)).toEqual([9, 10]);
		expect(requests.map((params) => params.get('cursor'))).toEqual(['5', '9']);
	});

	it('consults the cursor store on every connection attempt', async () => {
		const { requests, service, close } = startServer(perConnection([[commitFrame(20)], [commitFrame(200)]]));

		let stored: number | undefined = 19;

		const store: CursorStore = {
			load: () => stored,
			save: () => {},
		};

		const stream = subscribeEvents({ service, cursor: store, ws: WS_OPTIONS });
		const iterator = stream[Symbol.asyncIterator]();

		expect(await iterator.next()).toMatchObject({ done: false, value: { seq: 20 } });
		stored = 150;
		expect(await iterator.next()).toMatchObject({ done: false, value: { seq: 200 } });

		await iterator.return?.();
		await close();
		expect(requests.map((params) => params.get('cursor'))).toEqual(['19', '150']);
	});

	it('persists throttled progress before reconnecting', async () => {
		const { requests, service, close } = startServer(
			perConnection([[commitFrame(30), commitFrame(31)], [commitFrame(32)]]),
		);

		const saves: number[] = [];
		let stored: number | undefined;

		const store: CursorStore = {
			load: () => stored,
			save: (seq) => {
				saves.push(seq);
				stored = seq;
			},
		};

		const stream = subscribeEvents({
			service,
			cursor: store,
			cursorSaveInterval: 60_000,
			ws: WS_OPTIONS,
		});
		const received = await take(stream, 3);

		await close();
		expect(received.map((message) => message.seq)).toEqual([30, 31, 32]);
		expect(saves).toEqual([30, 31]);
		expect(requests.map((params) => params.get('cursor'))).toEqual([null, '31']);
	});

	it('serializes the filters as query parameters', async () => {
		const { requests, service, close } = startServer((socket) => {
			socket.send(commitFrame(1));
		});

		const stream = subscribeEvents({
			service,
			collections: ['app.bsky.feed.like', 'app.bsky.feed.*'],
			dids: ['did:plc:eygmaihciaxprqvxpfvl6flk'],
			kinds: ['commit'],
			maxMessageSizeBytes: 4096,
			ws: WS_OPTIONS,
		});
		await take(stream, 1);

		await close();

		const params = requests[0];
		expect(params.getAll('collections')).toEqual(['app.bsky.feed.like', 'app.bsky.feed.*']);
		expect(params.getAll('dids')).toEqual(['did:plc:eygmaihciaxprqvxpfvl6flk']);
		expect(params.getAll('kinds')).toEqual(['commit']);
		expect(params.get('maxMessageSizeBytes')).toBe('4096');
	});

	it('omits the filters the caller left out', async () => {
		const { requests, service, close } = startServer((socket) => {
			socket.send(commitFrame(1));
		});

		await take(subscribeEvents({ service, ws: WS_OPTIONS }), 1);

		await close();
		expect([...requests[0].keys()]).toEqual([]);
	});

	it('treats error frames as recoverable and keeps streaming', async () => {
		const { service, close } = startServer(
			perConnection([[errorFrame('ConsumerTooSlow')], [commitFrame(1)]]),
		);

		const errors: unknown[] = [];

		const stream = subscribeEvents({
			service,
			ws: WS_OPTIONS,
			onError: (err) => void errors.push(err),
		});
		const received = await take(stream, 1);

		await close();
		expect(received.map((message) => message.seq)).toEqual([1]);
		expect(errors).toHaveLength(1);
		expect(errors[0]).toBeInstanceOf(FirehoseError);
		expect(errors[0]).toMatchObject({ error: 'ConsumerTooSlow' });
	});

	it('flushes the cursor store when the signal aborts', async () => {
		const { service, close } = startServer((socket) => {
			socket.send(commitFrame(5));
			socket.send(commitFrame(6));
		});

		const { saves, store } = spyCursorStore();
		const controller = new AbortController();
		const reason = new Error(`stop`);

		const stream = subscribeEvents({
			service,
			cursor: store,
			cursorSaveInterval: 60_000,
			signal: controller.signal,
			ws: WS_OPTIONS,
		});

		const iterator = stream[Symbol.asyncIterator]();
		expect(await iterator.next()).toMatchObject({ done: false, value: { seq: 5 } });
		expect(await iterator.next()).toMatchObject({ done: false, value: { seq: 6 } });
		expect(saves).toEqual([5]);

		controller.abort(reason);
		await expect(iterator.next()).rejects.toBe(reason);

		await close();
		expect(saves).toEqual([5, 6]);
	});

	it('reports a failing flush instead of masking why iteration ended', async () => {
		const { service, close } = startServer((socket) => {
			socket.send(commitFrame(5));
			socket.send(commitFrame(6));
		});

		const failure = new Error(`storage is full`);
		const store: CursorStore = {
			load: () => undefined,
			save: (seq) => {
				if (seq === 6) {
					throw failure;
				}
			},
		};

		const errors: unknown[] = [];
		const controller = new AbortController();
		const reason = new Error(`stop`);

		const stream = subscribeEvents({
			service,
			cursor: store,
			cursorSaveInterval: 60_000,
			signal: controller.signal,
			ws: WS_OPTIONS,
			onError: (err) => void errors.push(err),
		});

		const iterator = stream[Symbol.asyncIterator]();
		await iterator.next();
		await iterator.next();

		controller.abort(reason);
		await expect(iterator.next()).rejects.toBe(reason);

		await close();
		expect(errors).toEqual([failure]);
	});
});
