import { describe, expect, it } from 'vitest';
import { type WebSocket, WebSocketServer } from 'ws';

import { JetstreamSubscription } from './subscription.ts';

describe('jetstream subscription', () => {
	it('routes malformed messages to onError instead of throwing', async () => {
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

		const subscription = new JetstreamSubscription({
			url: `ws://127.0.0.1:${address.port}`,
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
