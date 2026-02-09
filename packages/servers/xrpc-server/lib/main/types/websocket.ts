import type { Promisable } from '../../types/misc.ts';

export interface WebSocketConnection {
	signal: AbortSignal;
	send(data: Uint8Array): void | Promise<void>;
	close(code?: number, reason?: string): void;
}

export interface WebSocketAdapter {
	upgrade(
		request: Request,
		handler: (ws: WebSocketConnection) => Promisable<void>,
	): Promisable<Response | undefined>;
}
