import { decodeUtf8From } from '@atcute/uint8array';

import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { type RawData, type WebSocket, WebSocketServer } from 'ws';

import { TapSubscription } from './tap-subscription.ts';
import { flattenTapEvent, tapEventWireSchema, type tapRecordEventWireSchema } from './typedefs.ts';

type RecordEventWire = v.InferOutput<typeof tapRecordEventWireSchema>;

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
	it('accepts create events without record', () => {
		const result = v.safeParse(tapEventWireSchema, createRecordEventWithoutRecord(1));
		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		const evt = flattenTapEvent(result.output);
		expect(evt.type).toBe('record');
		if (evt.type !== 'record' || evt.action !== 'create') {
			throw new Error(`unexpected event`);
		}

		expect(evt.cid).toBe('bafyreigkq6j3o7v2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2xq2x');
		expect(evt.record).toBeUndefined();
	});

	it('accepts delete events without cid or record', () => {
		const result = v.safeParse(tapEventWireSchema, deleteRecordEvent(2));
		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		const evt = flattenTapEvent(result.output);
		expect(evt.type).toBe('record');
		if (evt.type !== 'record' || evt.action !== 'delete') {
			throw new Error(`unexpected event`);
		}

		expect('cid' in evt).toBe(false);
		expect('record' in evt).toBe(false);
	});

	it('rejects update events missing cid', () => {
		const result = v.safeParse(tapEventWireSchema, {
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
		});

		expect(result.success).toBe(false);
	});
});
