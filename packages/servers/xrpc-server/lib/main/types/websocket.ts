import type { Promisable } from '../../types/misc.ts';

export interface WebSocketConnection {
	signal: AbortSignal;
	send(data: Uint8Array): void | Promise<void>;
	/**
	 * backpressure hook invoked by the router after every frame it sends.
	 * adapters that can observe the outgoing send buffer (Node `ws`, Bun, Deno)
	 * should resolve only once the buffer has drained below a healthy threshold.
	 * adapters without that visibility (e.g. Cloudflare Workers) should return
	 * synchronously.
	 */
	drain(): void | Promise<void>;
	close(code?: number, reason?: string): void;
}

export interface WebSocketAdapter {
	upgrade(
		request: Request,
		handler: (ws: WebSocketConnection) => Promisable<void>,
	): Promisable<Response | undefined>;
}
