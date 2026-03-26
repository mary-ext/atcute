import { AsyncLocalStorage } from 'node:async_hooks';

import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import type { Promisable } from '../../types/misc.ts';
import type { XRPCRouter } from '../router.ts';
import type { WebSocketAdapter, WebSocketConnection } from '../types/websocket.ts';

interface WebSocketHandlerContext {
	handler: ((ws: WebSocketConnection) => Promisable<void>) | null;
}

export interface CloseEvent {
	code: number;
	reason: string;
	wasClean: boolean;
}

export interface SubscriptionClient extends Disposable {
	onMessage: SimpleEventEmitter<[data: Uint8Array]>;
	onClose: SimpleEventEmitter<[event: CloseEvent]>;
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

				const onMessage = new SimpleEventEmitter<[data: Uint8Array]>();
				const onClose = new SimpleEventEmitter<[event: CloseEvent]>();

				const controller = new AbortController();
				const signal = controller.signal;

				const connection: WebSocketConnection = {
					signal: signal,
					send(data) {
						onMessage.emit(data);
					},
					close(code = 1000, reason = '') {
						if (!signal.aborted) {
							onClose.emit({ code, reason, wasClean: true });
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
					onMessage,
					onClose,
					dispose() {
						if (!signal.aborted) {
							onClose.emit({ code: 1000, reason: '', wasClean: true });
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
