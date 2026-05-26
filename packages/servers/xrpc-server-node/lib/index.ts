import { AsyncLocalStorage } from 'node:async_hooks';
import type { IncomingMessage, Server } from 'node:http';
import type { Http2SecureServer, Http2Server } from 'node:http2';
import type { Duplex } from 'node:stream';

import type { WebSocketAdapter, WebSocketConnection, XRPCRouter } from '@atcute/xrpc-server';

import { WebSocketServer } from 'ws';

type Promisable<T> = T | Promise<T>;

export interface NodeWebSocket {
	adapter: WebSocketAdapter;
	wss: WebSocketServer;
	injectWebSocket(server: Server | Http2Server | Http2SecureServer, router: XRPCRouter): void;
}

export interface CreateNodeWebSocketOptions {
	/** backpressure high water mark in bytes; defaults to 250 KB. */
	highWaterMark?: number;
	/** backpressure low water mark in bytes; defaults to 50 KB. */
	lowWaterMark?: number;
}

interface WebSocketHandlerContext {
	handler: ((ws: WebSocketConnection) => Promisable<void>) | null;
}

export const createNodeWebSocket = ({
	highWaterMark = 250_000,
	lowWaterMark = 50_000,
}: CreateNodeWebSocketOptions = {}): NodeWebSocket => {
	const context = new AsyncLocalStorage<WebSocketHandlerContext>();
	const wss = new WebSocketServer({ noServer: true });

	return {
		wss,
		adapter: {
			async upgrade(_request, handler) {
				const ctx = context.getStore();
				if (!ctx) {
					return undefined;
				}

				ctx.handler = handler;
				return new Response(null);
			},
		},
		injectWebSocket(server, router) {
			server.on('upgrade', async (request: IncomingMessage, socket: Duplex, head: Buffer) => {
				// Node's 'upgrade' event is shared across all listeners; bail before touching the socket
				// when the request isn't ours, so other listeners (Vite HMR, in-app WebSocket routes,
				// etc.) can handle it.
				if (!request.url?.startsWith('/xrpc/')) {
					return;
				}

				const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
				const headers = new Headers();

				for (const [key, value] of Object.entries(request.headers)) {
					if (value !== undefined) {
						if (Array.isArray(value)) {
							for (const v of value) {
								headers.append(key, v);
							}
						} else {
							headers.set(key, value);
						}
					}
				}

				const ctx: WebSocketHandlerContext = {
					handler: null,
				};

				const response = await context.run(ctx, async (): Promise<Response> => {
					const webRequest = new Request(url, { method: request.method, headers });
					const response = await router.fetch(webRequest);

					return response;
				});

				if (ctx.handler) {
					const handler = ctx.handler;

					wss.handleUpgrade(request, socket, head, (ws) => {
						wss.emit('connection', ws, request);

						const controller = new AbortController();
						const signal = controller.signal;
						const connection: WebSocketConnection = {
							signal: signal,
							send(data) {
								return new Promise((resolve, reject) => {
									ws.send(data, (err) => {
										if (err) {
											reject(err);
										} else {
											resolve();
										}
									});
								});
							},
							async drain() {
								if (ws.bufferedAmount <= highWaterMark) {
									return;
								}

								while (!signal.aborted && ws.readyState === 1 && ws.bufferedAmount > lowWaterMark) {
									await sleep(10, signal);
								}
							},
							close(code, reason) {
								ws.close(code, reason);
							},
						};

						ws.onclose = (ev) => {
							controller.abort(new Error(`WebSocket connection closed with code ${ev.code}`));
						};

						handler(connection);
					});
				} else {
					socket.end(
						`HTTP/1.1 ${response.status} ${response.statusText}\r\n` +
							Array.from(response.headers.entries())
								.map(([k, v]) => `${k}: ${v}`)
								.join('\r\n') +
							'\r\n\r\n',
					);
				}
			});
		},
	};
};

const sleep = (ms: number, signal: AbortSignal): Promise<void> => {
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			signal.removeEventListener('abort', onAbort);
			resolve();
		}, ms);

		const onAbort = () => {
			clearTimeout(timer);
			resolve();
		};

		signal.addEventListener('abort', onAbort, { once: true });
	});
};
