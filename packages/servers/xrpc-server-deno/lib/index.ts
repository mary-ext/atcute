import type { WebSocketAdapter, WebSocketConnection } from '@atcute/xrpc-server';

export interface CreateDenoWebSocketOptions {
	/** backpressure high water mark in bytes; defaults to 250 KB. */
	highWaterMark?: number;
	/** backpressure low water mark in bytes; defaults to 50 KB. */
	lowWaterMark?: number;
}

export const createDenoWebSocket = ({
	highWaterMark = 250_000,
	lowWaterMark = 50_000,
}: CreateDenoWebSocketOptions = {}): WebSocketAdapter => {
	return {
		async upgrade(request, handler) {
			const { response, socket } = Deno.upgradeWebSocket(request);

			const controller = new AbortController();
			const signal = controller.signal;
			const connection: WebSocketConnection = {
				signal: signal,
				send(data: Uint8Array) {
					socket.send(data as Uint8Array<ArrayBuffer>);
				},
				async drain() {
					if (socket.bufferedAmount <= highWaterMark) {
						return;
					}

					while (
						!signal.aborted &&
						socket.readyState === WebSocket.OPEN &&
						socket.bufferedAmount > lowWaterMark
					) {
						await sleep(10, signal);
					}
				},
				close(code?: number, reason?: string) {
					socket.close(code, reason);
				},
			};

			socket.onopen = () => {
				handler(connection);
			};

			socket.onclose = (ev) => {
				controller.abort(new Error(`WebSocket connection closed with code ${ev.code}`));
			};

			return response;
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
