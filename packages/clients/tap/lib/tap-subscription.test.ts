import { decodeUtf8From } from '@atcute/uint8array';

import * as v from '@badrap/valita';
import { describe, expect, it } from 'vitest';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';

import { TapSubscription } from './tap-subscription.ts';
import { flattenTapEvent, tapEventWireSchema, tapRecordEventWireSchema } from './typedefs.ts';

type RecordEventWire = v.Infer<typeof tapRecordEventWireSchema>;

const createRecordEvent = (id: number): RecordEventWire => ({
	id,
	type: 'record',
	record: {
		did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
		rev: '3k3m5z2zq2f2x',
		collection: 'app.bsky.feed.post',
		rkey: '3k3m5z2zq2f2x',
		action: 'create',
		record: { text: 'hello', $type: 'app.bsky.feed.post' },
		cid: 'bafyreigkq6j3o7v2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2x',
		live: true,
	},
});

const createRecordEventWithoutRecord = (id: number): RecordEventWire => ({
	id,
	type: 'record',
	record: {
		did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
		rev: '3k3m5z2zq2f2x',
		collection: 'app.bsky.feed.post',
		rkey: '3k3m5z2zq2f2x',
		action: 'create',
		cid: 'bafyreigkq6j3o7v2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2x',
		live: true,
	},
});

const deleteRecordEvent = (id: number): RecordEventWire => ({
	id,
	type: 'record',
	record: {
		did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
		rev: '3k3m5z2zq2f2x',
		collection: 'app.bsky.feed.post',
		rkey: '3k3m5z2zq2f2x',
		action: 'delete',
		live: true,
	},
});

describe('tap subscription', () => {
	it('receives events and sends acks', async () => {
		const server = new WebSocketServer({ port: 0 });
		const address = server.address();
		if (typeof address === 'string' || address === null) {
			throw new Error(`unexpected ws address`);
		}

		const receivedAcks: number[] = [];

		server.on('connection', (socket: WebSocket) => {
			socket.send(JSON.stringify(createRecordEvent(42)));
			socket.on('message', (data: RawData) => {
				const msg = JSON.parse(typeof data === 'string' ? data : decodeUtf8From(data as Uint8Array));
				if (msg.type === 'ack') {
					receivedAcks.push(msg.id);
					socket.close();
				}
			});
		});

		const subscription = new TapSubscription({
			url: `ws://127.0.0.1:${address.port}/channel`,
		});

		const iterator = subscription[Symbol.asyncIterator]();
		const next = await iterator.next();
		if (next.done) {
			throw new Error(`expected message`);
		}

		expect(next.value.event.type).toBe('record');
		await next.value.ack();

		await iterator.return?.();

		await new Promise<void>((resolve) => server.close(() => resolve()));
		expect(receivedAcks).toEqual([42]);
	});

	it('drops malformed messages', async () => {
		const server = new WebSocketServer({ port: 0 });
		const address = server.address();
		if (typeof address === 'string' || address === null) {
			throw new Error(`unexpected ws address`);
		}

		let errors = 0;

		server.on('connection', (socket: WebSocket) => {
			socket.send('not json');
			setTimeout(() => socket.close(), 25);
		});

		const subscription = new TapSubscription({
			url: `ws://127.0.0.1:${address.port}/channel`,
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
});

describe('tap event schemas', () => {
	const PARSE_OPTIONS = { mode: 'passthrough' } as const;

	it('accepts create events without record', () => {
		const result = tapEventWireSchema.try(createRecordEventWithoutRecord(1), PARSE_OPTIONS);
		expect(result.ok).toBe(true);
		if (!result.ok) {
			return;
		}

		const evt = flattenTapEvent(result.value);
		expect(evt.type).toBe('record');
		if (evt.type !== 'record' || evt.action !== 'create') {
			throw new Error(`unexpected event`);
		}

		expect(evt.cid).toBe('bafyreigkq6j3o7v2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2x');
		expect(evt.record).toBeUndefined();
	});

	it('accepts delete events without cid or record', () => {
		const result = tapEventWireSchema.try(deleteRecordEvent(2), PARSE_OPTIONS);
		expect(result.ok).toBe(true);
		if (!result.ok) {
			return;
		}

		const evt = flattenTapEvent(result.value);
		expect(evt.type).toBe('record');
		if (evt.type !== 'record' || evt.action !== 'delete') {
			throw new Error(`unexpected event`);
		}

		expect('cid' in evt).toBe(false);
		expect('record' in evt).toBe(false);
	});

	it('rejects update events missing cid', () => {
		const result = tapEventWireSchema.try(
			{
				id: 3,
				type: 'record',
				record: {
					did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
					rev: '3k3m5z2zq2f2x',
					collection: 'app.bsky.feed.post',
					rkey: '3k3m5z2zq2f2x',
					action: 'update',
					live: true,
				},
			},
			PARSE_OPTIONS,
		);

		expect(result.ok).toBe(false);
	});
});
