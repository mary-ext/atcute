import { AsyncLocalStorage } from 'node:async_hooks';

import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import type { Promisable } from '../../types/misc.ts';
import type { XRPCRouter } from '../router.ts';
import type { WebSocketAdapter, WebSocketConnection, WebSocketUpgradeOptions } from '../types/websocket.ts';

interface WebSocketHandlerContext {
	handler: ((ws: WebSocketConnection) => Promisable<void>) | null;
	protocol?: string;
}

export interface CloseEvent {
	code: number;
	reason: string;
	wasClean: boolean;
}

export interface SubscriptionClient extends Disposable {
	/** subprotocol the server echoed in the handshake, or undefined when none was negotiated */
	protocol: string | undefined;
	onMessage: SimpleEventEmitter<[data: string | Uint8Array]>;
	onClose: SimpleEventEmitter<[event: CloseEvent]>;
	dispose(): void;
}

export interface SubscribeOptions {
	/** wire subprotocols to offer via `Sec-WebSocket-Protocol`, in preference order */
	protocols?: string[];
}

export interface SubscriptionMock {
	subscribe(url: string, options?: SubscribeOptions): Promise<SubscriptionClient>;
}

export class MockWebSocketAdapter implements WebSocketAdapter {
	#context = new AsyncLocalStorage<WebSocketHandlerContext>();

	upgrade(
		_request: Request,
		handler: (ws: WebSocketConnection) => Promisable<void>,
		options?: WebSocketUpgradeOptions,
	): Promisable<Response | undefined> {
		const ctx = this.#context.getStore();
		if (!ctx) {
			return undefined;
		}

		ctx.handler = handler;
		ctx.protocol = options?.protocol;

		return new Response(null);
	}

	attach(router: XRPCRouter): SubscriptionMock {
		return {
			subscribe: async (url, options) => {
				const ctx: WebSocketHandlerContext = {
					handler: null,
				};

				await this.#context.run(ctx, async () => {
					const urlp = new URL(url, 'http://localhost');
					const headers: Record<string, string> = {
						upgrade: 'websocket',
						connection: 'upgrade',
					};

					if (options?.protocols !== undefined) {
						headers['sec-websocket-protocol'] = options.protocols.join(', ');
					}

					const request = new Request(urlp, { headers: headers });

					const response = await router.fetch(request);

					return response;
				});

				if (!ctx.handler) {
					throw new Error(`WebSocket upgrade succeeded but no handler was set`);
				}

				const onMessage = new SimpleEventEmitter<[data: string | Uint8Array]>();
				const onClose = new SimpleEventEmitter<[event: CloseEvent]>();

				const controller = new AbortController();
				const signal = controller.signal;

				const connection: WebSocketConnection = {
					signal: signal,
					send(data) {
						onMessage.emit(data);
					},
					drain() {
						// tests have no outgoing buffer to observe
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
					protocol: ctx.protocol,
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
