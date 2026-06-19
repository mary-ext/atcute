import type { WebSocketAdapter, WebSocketConnection } from '@atcute/xrpc-server';

export const createCloudflareWebSocket = (): WebSocketAdapter => {
	return {
		async upgrade(_request, handler, options) {
			const [client, server] = Object.values(new WebSocketPair());

			const controller = new AbortController();
			const connection: WebSocketConnection = {
				signal: controller.signal,
				send: (data) => {
					server.send(data);
				},
				drain: () => {
					// Cloudflare Workers do not surface the outgoing WebSocket buffer;
					// there is no way to apply backpressure at this layer.
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

			// observe synchronous throws / unawaited rejections from the handler so the
			// socket is closed with an internal-error code instead of leaking as an
			// unhandled rejection.
			void (async () => handler(connection))().catch(() => {
				server.close(1011, `internal server error`);
			});

			return new Response(null, {
				status: 101,
				webSocket: client,
				headers: options?.protocol ? { 'sec-websocket-protocol': options.protocol } : undefined,
			});
		},
	};
};
