import { AsyncLocalStorage } from 'node:async_hooks';

import type { Promisable } from '../../types/misc.js';
import type { XRPCRouter } from '../router.js';
import type { WebSocketAdapter, WebSocketConnection } from '../types/websocket.js';

import { EventEmitter } from './event-emitter.js';

interface WebSocketHandlerContext {
	handler: ((ws: WebSocketConnection) => Promisable<void>) | null;
}

export interface SubscriptionClient extends Disposable {
	events: EventEmitter<{
		message: [data: Uint8Array];
		close: [event: { code: number; reason: string; wasClean: boolean }];
	}>;
	dispose(): void;
}

export interface SubscriptionMock {
	subscribe(url: string): Promise<SubscriptionClient>;
}

export class MockWebSocketAdapter implements WebSocketAdapter {
	#context = new AsyncLocalStorage<WebSocketHandlerContext>();

	upgrade(
		_request: Request,
		handler: (ws: WebSocketConnection) => Promisable<void>,
	): Promisable<Response | undefined> {
		const ctx = this.#context.getStore();
		if (!ctx) {
			return undefined;
		}

		ctx.handler = handler;

		return new Response(null);
	}

	attach(router: XRPCRouter): SubscriptionMock {
		return {
			subscribe: async (url) => {
				const ctx: WebSocketHandlerContext = {
					handler: null,
				};

				await this.#context.run(ctx, async () => {
					const urlp = new URL(url, 'http://localhost');
					const request = new Request(urlp, {
						headers: {
							upgrade: 'websocket',
							connection: 'upgrade',
						},
					});

					const response = await router.fetch(request);

					return response;
				});

				if (!ctx.handler) {
					throw new Error(`WebSocket upgrade succeeded but no handler was set`);
				}

				const events = new EventEmitter<{
					message: [data: Uint8Array];
					close: [event: { code: number; reason: string; wasClean: boolean }];
				}>();

				const controller = new AbortController();
				const signal = controller.signal;

				const connection: WebSocketConnection = {
					signal: signal,
					send(data) {
						events.emit('message', data);
					},
					close(code = 1000, reason = '') {
						if (!signal.aborted) {
							events.emit('close', { code, reason, wasClean: true });
							controller.abort();
						}
					},
				};

				{
					const handler = ctx.handler;
					setTimeout(() => {
						handler(connection);
					}, 1);
				}

				const client: SubscriptionClient = {
					events,
					dispose() {
						if (!signal.aborted) {
							events.emit('close', { code: 1000, reason: '', wasClean: true });
							controller.abort();
						}
					},
					[Symbol.dispose]() {
						this.dispose();
					},
				};

				return client;
			},
		};
	}
}
