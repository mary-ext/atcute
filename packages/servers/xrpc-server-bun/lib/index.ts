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

export const createBunWebSocket = (): BunWebSocket => {
	let server: Bun.Server<WsData> | undefined;

	return {
		adapter: {
			async upgrade(request, handler) {
				if (!server) {
					throw new Error(`server not defined yet`);
				}

				const data: WsData = {
					controller: new AbortController(),
					handler: handler,
				};

				const upgraded = server.upgrade(request, { data: data });

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

						const connection: WebSocketConnection = {
							signal: controller.signal,
							send(data) {
								ws.sendBinary(data);
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
