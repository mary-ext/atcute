import { type XRPCSubscriptionMetadata, safeParse } from '@atcute/lexicons/validations';

import { EventIterator } from '@mary-ext/event-iterator';
import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';
import { WebSocket as ReconnectingWebSocket } from 'partysocket';
import type { ReadonlyDeep } from 'type-fest';

import { addTypeToBody, decodeFrame } from './frame-decoder.ts';
import type { FirehoseSubscriptionOptions, MessageOf, ParamsOf } from './types.ts';

/**
 * non-fatal error frame received from the upstream firehose, carrying the atproto-spec `error` code alongside
 * the human-readable `message`.
 */
export class FirehoseError extends Error {
	override readonly name = 'FirehoseError';
	/** atproto error code from the error frame */
	readonly error: string;
	constructor(error: string, message?: string) {
		super(message ?? error);
		this.error = error;
	}
}

/** generic XRPC subscription client for AT Protocol */
export class FirehoseSubscription<TSchema extends XRPCSubscriptionMetadata> {
	#listening = 0;
	#ws?: ReconnectingWebSocket;

	#emitter = new SimpleEventEmitter<[message: MessageOf<TSchema>]>();

	#options: FirehoseSubscriptionOptions<TSchema>;

	/** creates a new firehose subscription */
	constructor(options: FirehoseSubscriptionOptions<TSchema>) {
		this.#options = options;
	}

	#create() {
		if (this.#ws !== undefined) {
			return;
		}

		const {
			service: wsUrls,
			nsid,
			params,
			ws: wsOptions,
			validateEvents = true,
			onConnectionClose,
			onConnectionError,
			onConnectionOpen,
			onError,
		} = this.#options;

		const emitter = this.#emitter;

		const getUrl = () => {
			let selectedUrl: string;

			if (typeof wsUrls === 'string') {
				selectedUrl = wsUrls;
			} else {
				selectedUrl = wsUrls[Math.floor(Math.random() * wsUrls.length)];
			}

			const url = new URL('/xrpc/' + nsid.nsid, selectedUrl);

			const currentParams: ParamsOf<TSchema> = typeof params === 'function' ? params() : params;

			if (currentParams !== undefined && currentParams !== null) {
				const paramObj = currentParams as Record<string, unknown>;
				for (const key in paramObj) {
					const value = paramObj[key];
					if (value !== undefined && value !== null) {
						if (Array.isArray(value)) {
							for (let idx = 0, len = value.length; idx < len; idx++) {
								url.searchParams.append(key, String(value[idx]));
							}
						} else {
							url.searchParams.set(key, String(value));
						}
					}
				}
			}

			return url.toString();
		};

		const ws = new ReconnectingWebSocket(getUrl, null, wsOptions);
		this.#ws = ws;

		ws.binaryType = 'arraybuffer';

		ws.onerror = onConnectionError ?? null;
		ws.onclose = onConnectionClose ?? null;
		ws.onopen = onConnectionOpen ?? null;

		ws.onmessage = (ev) => {
			const buffer = new Uint8Array(ev.data);

			let frame;
			try {
				frame = decodeFrame(buffer);
			} catch (err) {
				onError?.(new Error(`failed to decode frame`, { cause: err }));
				return;
			}

			if (frame.type === 'error') {
				onError?.(new FirehoseError(frame.error, frame.message));
				return;
			}

			let body = addTypeToBody(frame.body, frame.discriminator, nsid.nsid);

			if (validateEvents && nsid.message !== null) {
				const result = safeParse(nsid.message, body);
				if (!result.ok) {
					if (onError) {
						try {
							result.throw();
						} catch (err) {
							onError(err);
						}
					}
					return;
				}
				body = result.value;
			}

			emitter.emit(body as MessageOf<TSchema>);
		};
	}

	#destroy() {
		const ws = this.#ws;
		if (ws === undefined) {
			return;
		}

		ws.close();

		this.#ws = undefined;
	}

	[Symbol.asyncIterator]() {
		return new EventIterator<MessageOf<TSchema>>((emit) => {
			if (this.#listening === 0) {
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

	/** get current subscription options */
	getOptions(): ReadonlyDeep<FirehoseSubscriptionOptions<TSchema>> {
		return this.#options as ReadonlyDeep<FirehoseSubscriptionOptions<TSchema>>;
	}

	/** update subscription options, triggering a reconnection if currently connected */
	updateOptions(options: Partial<FirehoseSubscriptionOptions<TSchema>>): void {
		this.#options = { ...this.#options, ...options };

		if (this.#ws !== undefined) {
			this.#destroy();
			this.#create();
		}
	}
}
