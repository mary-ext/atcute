import type { WebSocketAdapter, WebSocketConnection } from '@atcute/xrpc-server';

export const createCloudflareWebSocket = (): WebSocketAdapter => {
	return {
		async upgrade(_request, handler) {
			const [client, server] = Object.values(new WebSocketPair());

			const controller = new AbortController();
			const connection: WebSocketConnection = {
				signal: controller.signal,
				send: (data: Uint8Array) => {
					server.send(data);
				},
				close: (code?: number, reason?: string) => {
					server.close(code, reason);
				},
			};

			server.onclose = (ev) => {
				controller.abort(new Error(`WebSocket connection closed with code ${ev.code}`));
			};
			server.onerror = () => {
				controller.abort(new Error(`WebSocket connection closed abruptly`));
			};

			server.accept();
			handler(connection);

			return new Response(null, { status: 101, webSocket: client });
		},
	};
};
