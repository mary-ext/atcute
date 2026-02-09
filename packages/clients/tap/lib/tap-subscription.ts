import { decodeUtf8From } from '@atcute/uint8array';

import { EventIterator } from '@mary-ext/event-iterator';
import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';
import { WebSocket as ReconnectingWebSocket } from 'partysocket';
import type { ReadonlyDeep } from 'type-fest';

import { flattenTapEvent, tapEventWireSchema } from './typedefs.ts';
import type { TapEvent, TapSubscribeOptions, TapSubscriptionMessage } from './types.ts';
import { formatAdminAuthHeader } from './utils.ts';

export interface TapSubscriptionOptions extends TapSubscribeOptions {
	url: string;
	adminPassword?: string;
}

type BufferedAck = {
	id: number;
	promise: Promise<void>;
	resolve: (value: void) => void;
	reject: (reason?: unknown) => void;
};

const PARSE_OPTIONS = { mode: 'passthrough' } as const;

export class TapSubscription {
	#listening = 0;
	#ws?: ReconnectingWebSocket;

	#emitter = new SimpleEventEmitter<[message: TapSubscriptionMessage]>();
	#bufferedAcks: BufferedAck[] = [];

	#options: TapSubscriptionOptions;
	#closed = false;

	constructor(options: TapSubscriptionOptions) {
		this.#options = options;
	}

	#sendAck(id: number): boolean {
		const ws = this.#ws;
		if (ws === undefined) {
			return false;
		}

		if (ws.readyState !== 1) {
			return false;
		}

		ws.send(JSON.stringify({ type: 'ack', id }));
		return true;
	}

	async #ackEvent(id: number): Promise<void> {
		if (this.#closed) {
			throw new Error(`tap subscription is closed`);
		}

		try {
			if (this.#sendAck(id)) {
				return;
			}
		} catch {
			// fall through to buffering
		}

		const { promise, resolve, reject } = Promise.withResolvers<void>();
		this.#bufferedAcks.push({ id, promise, resolve, reject });
		return await promise;
	}

	#flushBufferedAcks() {
		while (this.#bufferedAcks.length > 0) {
			const ack = this.#bufferedAcks[0];
			if (ack === undefined) {
				return;
			}

			try {
				if (!this.#sendAck(ack.id)) {
					return;
				}

				ack.resolve(undefined);
				this.#bufferedAcks = this.#bufferedAcks.slice(1);
			} catch (err) {
				this.#options.onError?.(err);
				return;
			}
		}
	}

	#create() {
		if (this.#ws !== undefined) {
			return;
		}

		const {
			url,
			adminPassword,
			ws: wsOptions,
			validateEvents = true,
			onConnectionClose,
			onConnectionError,
			onConnectionOpen,
			onError,
		} = this.#options;

		const emitter = this.#emitter;

		const authHeader = adminPassword ? formatAdminAuthHeader(adminPassword) : undefined;

		const mergedWsOptions =
			authHeader !== undefined && wsOptions?.WebSocket === undefined
				? {
						...wsOptions,
						WebSocket: createAuthedWebSocket(authHeader),
					}
				: wsOptions;

		const ws = new ReconnectingWebSocket(() => url, null, mergedWsOptions);
		this.#ws = ws;

		ws.binaryType = 'arraybuffer';

		ws.onclose = onConnectionClose ?? null;
		ws.onerror = onConnectionError ?? null;

		ws.onopen = (ev) => {
			this.#flushBufferedAcks();
			onConnectionOpen?.(ev);
		};

		ws.onmessage = (ev) => {
			let raw: unknown;
			try {
				const data = toMessageText(ev.data);
				raw = JSON.parse(data);
			} catch (err) {
				onError?.(new Error(`failed to parse tap message`, { cause: err }));
				return;
			}

			let evt: TapEvent;
			if (validateEvents) {
				const result = tapEventWireSchema.try(raw, PARSE_OPTIONS);
				if (!result.ok) {
					onError?.(result);
					return;
				}

				evt = flattenTapEvent(result.value);
			} else {
				try {
					evt = flattenTapEvent(raw as any);
				} catch (err) {
					onError?.(err);
					return;
				}
			}

			let acked = false;
			let ackPromise: Promise<void> | undefined;

			emitter.emit({
				event: evt,
				ack: () => {
					if (!acked) {
						acked = true;
						ackPromise = this.#ackEvent(evt.id);
					}
					return ackPromise!;
				},
			});
		};
	}

	#destroy() {
		const ws = this.#ws;
		if (ws) {
			ws.close();
			this.#ws = undefined;
		}

		this.#closed = true;

		if (this.#bufferedAcks.length > 0) {
			const err = new Error(`tap subscription closed before ack was sent`);
			for (const ack of this.#bufferedAcks) {
				ack.reject(err);
			}
			this.#bufferedAcks = [];
		}
	}

	[Symbol.asyncIterator]() {
		return new EventIterator<TapSubscriptionMessage>((emit) => {
			if (this.#listening === 0) {
				this.#closed = false;
				this.#create();
			}

			this.#listening++;
			this.#emitter.subscribe(emit);

			return () => {
				if (this.#listening === 1) {
					this.#destroy();
				}

				this.#listening--;
				this.#emitter.unsubscribe(emit);
			};
		});
	}

	getOptions(): ReadonlyDeep<TapSubscriptionOptions> {
		return this.#options;
	}

	updateOptions(options: Partial<TapSubscriptionOptions>): void {
		this.#options = { ...this.#options, ...options };

		if (this.#ws !== undefined) {
			this.#destroy();
			this.#closed = false;
			this.#create();
		}
	}
}

const toMessageText = (data: unknown): string => {
	if (typeof data === 'string') {
		return data;
	}

	if (data instanceof ArrayBuffer) {
		return decodeUtf8From(new Uint8Array(data));
	}

	if (ArrayBuffer.isView(data)) {
		return decodeUtf8From(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
	}

	return String(data);
};

const createAuthedWebSocket = (authorization: string) => {
	const WebSocketCtor = WebSocket as unknown as {
		new (
			url: string | URL,
			protocols?: string | string[],
			options?: { headers?: Record<string, string> },
		): WebSocket;
	};

	return class AuthedWebSocket extends WebSocketCtor {
		constructor(url: string | URL, protocols?: string | string[]) {
			super(url, protocols as any, {
				headers: {
					Authorization: authorization,
				},
			});
		}
	};
};
