import type { WebSocketAdapter, WebSocketConnection, XRPCRouter } from '@atcute/xrpc-server';

type Promisable<T> = T | Promise<T>;

interface WsData {
	controller: AbortController;
	handler: (ws: WebSocketConnection) => Promisable<void>;
}

export interface BunWebSocket {
	adapter: WebSocketAdapter;
	wrap(router: XRPCRouter): {
		fetch(request: Request, server: Bun.Server<WsData>): Promise<Response>;
		websocket: Bun.WebSocketHandler<WsData>;
	};
}

export interface CreateBunWebSocketOptions {
	/** backpressure high water mark in bytes; defaults to 250 KB. */
	highWaterMark?: number;
	/** backpressure low water mark in bytes; defaults to 50 KB. */
	lowWaterMark?: number;
}

export const createBunWebSocket = ({
	highWaterMark = 250_000,
	lowWaterMark = 50_000,
}: CreateBunWebSocketOptions = {}): BunWebSocket => {
	let server: Bun.Server<WsData> | undefined;

	return {
		adapter: {
			async upgrade(request, handler, options) {
				if (!server) {
					throw new Error(`server not defined yet`);
				}

				const data: WsData = {
					controller: new AbortController(),
					handler: handler,
				};

				const upgraded = server.upgrade(request, {
					data: data,
					headers: options?.protocol ? { 'sec-websocket-protocol': options.protocol } : undefined,
				});

				if (upgraded) {
					return new Response(null);
				}

				return undefined;
			},
		},
		wrap(router) {
			return {
				fetch(request, serve) {
					server = serve;
					return router.fetch(request);
				},
				websocket: {
					async open(ws) {
						const { controller, handler } = ws.data;
						const signal = controller.signal;

						const connection: WebSocketConnection = {
							signal: signal,
							send(data) {
								if (typeof data === 'string') {
									ws.send(data);
								} else {
									ws.sendBinary(data);
								}
							},
							async drain() {
								if (ws.getBufferedAmount() <= highWaterMark) {
									return;
								}

								while (!signal.aborted && ws.readyState === 1 && ws.getBufferedAmount() > lowWaterMark) {
									await sleep(10, signal);
								}
							},
							close(code, reason) {
								ws.close(code, reason);
							},
						};

						await handler(connection);
					},
					close(ws, code, _reason) {
						const { controller } = ws.data;

						controller.abort(new Error(`WebSocket connection closed with code ${code}`));
					},
					message() {
						// noop
					},
				},
			};
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
