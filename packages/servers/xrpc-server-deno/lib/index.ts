import type { WebSocketAdapter, WebSocketConnection } from '@atcute/xrpc-server';

export const createDenoWebSocket = (): WebSocketAdapter => {
	return {
		async upgrade(request, handler) {
			const { response, socket } = Deno.upgradeWebSocket(request);

			const controller = new AbortController();
			const connection: WebSocketConnection = {
				signal: controller.signal,
				send(data: Uint8Array) {
					socket.send(data as Uint8Array<ArrayBuffer>);
				},
				close(code?: number, reason?: string) {
					socket.close(code, reason);
				},
			};

			socket.onopen = () => {
				handler(connection);
			};

			socket.onclose = (ev) => {
				controller.abort(`WebSocket connection closed with code ${ev.code}`);
			};

			return response;
		},
	};
};
