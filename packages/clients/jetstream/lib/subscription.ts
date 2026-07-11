import type { Did } from '@atcute/lexicons';

import { EventIterator } from '@mary-ext/event-iterator';
import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';
import { WebSocket as ReconnectingWebSocket } from 'partysocket';
import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';
import type { ReadonlyDeep } from 'type-fest';
import * as v from 'valibot';

import { type JetstreamEvent, type JetstreamProcedure, jetstreamEventSchema } from './typedefs.ts';

export interface JetstreamSubscriptionOptions {
	url: string | string[];

	cursor?: number;

	/**
	 * array of collection NSIDs that you're interested in receiving commit events for, pass in an empty array
	 * for no commit events.
	 */
	wantedCollections?: string[];
	/**
	 * array of account DIDs that you're interested in receiving commit events for, pass in an empty array for
	 * no commit events.
	 */
	wantedDids?: Did[];

	/**
	 * whether to validate Jetstream's events, you'd still need to validate the records.
	 *
	 * @default true
	 */
	validateEvents?: boolean;

	onConnectionOpen?: (event: Event) => void;
	onConnectionClose?: (event: CloseEvent) => void;
	onConnectionError?: (event: ErrorEvent) => void;
	/**
	 * called when an event fails schema validation. the error is a valibot `ValiError` carrying the validation
	 * issues. without a handler, invalid events are silently dropped.
	 */
	onError?: (err: unknown) => void;

	/** WebSocket connection options */
	ws?: Options;
}

export class JetstreamSubscription {
	#listening = 0;
	#ws?: ReconnectingWebSocket;

	#emitter = new SimpleEventEmitter<[event: JetstreamEvent]>();

	#options: JetstreamSubscriptionOptions;
	#cursor: number;
	#lastUsedUrl?: string;

	constructor(options: JetstreamSubscriptionOptions) {
		this.#options = options;
		this.#cursor = options.cursor ?? Date.now() * 1_000;

		// initialize to empty string for URL arrays to trigger cursor rollback on
		// first connection since we don't know which instance the cursor came
		// from in a previous session
		this.#lastUsedUrl = Array.isArray(options.url) ? '' : undefined;
	}

	#sendOptionsUpdate() {
		const ws = this.#ws;
		if (ws === undefined) {
			return;
		}

		const payload: JetstreamProcedure = {
			type: 'options_update',
			payload: {
				wantedCollections: this.#options.wantedCollections,
				wantedDids: this.#options.wantedDids,
			},
		};

		ws.send(JSON.stringify(payload));
	}

	#create() {
		if (this.#ws !== undefined) {
			return;
		}

		const {
			url: wsUrls,
			ws: wsOptions,
			validateEvents = true,
			onConnectionClose,
			onConnectionError,
			onConnectionOpen,
			onError,
		} = this.#options;
		const emitter = this.#emitter;

		let selectedUrl: string;

		const getUrl = () => {
			if (typeof wsUrls === 'string') {
				selectedUrl = wsUrls;
			} else {
				selectedUrl = wsUrls[Math.floor(Math.random() * wsUrls.length)];
			}

			let cursor = this.#cursor;
			if (this.#lastUsedUrl !== undefined && this.#lastUsedUrl !== selectedUrl) {
				// rollback cursor by 10 seconds when switching to a different instance
				// to ensure we don't miss any events due to clock differences
				cursor = Math.max(0, cursor - 10_000_000);
			}

			const url = new URL('/subscribe', selectedUrl);
			url.searchParams.set('requireHello', 'true');
			url.searchParams.set('cursor', '' + cursor);

			return url.toString();
		};

		const ws = new ReconnectingWebSocket(getUrl, null, wsOptions);
		this.#ws = ws;

		ws.binaryType = 'arraybuffer';

		ws.onerror = onConnectionError ?? null;
		ws.onclose = onConnectionClose ?? null;

		ws.onopen = (ev) => {
			this.#sendOptionsUpdate();
			onConnectionOpen?.(ev);
		};

		ws.onmessage = (ev) => {
			let raw: unknown;
			try {
				raw = JSON.parse(ev.data);
			} catch (err) {
				onError?.(new Error(`failed to parse jetstream message`, { cause: err }));
				return;
			}

			let event: JetstreamEvent;
			if (validateEvents) {
				const result = v.safeParse(jetstreamEventSchema, raw);
				if (!result.success) {
					onError?.(new v.ValiError(result.issues));
					return;
				}

				event = result.output;
			} else {
				event = raw as JetstreamEvent;
			}

			if (event.time_us > this.#cursor) {
				this.#cursor = event.time_us;

				// set `lastUsedUrl` now that we've passed the stored cursor.
				// ensures we cursor rollback still happens during a reconnection.
				this.#lastUsedUrl = selectedUrl;
			}

			emitter.emit(event);
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
		return new EventIterator<JetstreamEvent>((emit) => {
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

	get cursor() {
		return this.#cursor;
	}

	getOptions(): ReadonlyDeep<JetstreamSubscriptionOptions> {
		return this.#options;
	}

	updateOptions(options: Partial<JetstreamSubscriptionOptions>): void {
		const previousCursor = this.#cursor;

		this.#options = { ...this.#options, ...options };
		if (options.cursor !== undefined) {
			this.#cursor = options.cursor;
		}

		if (this.#ws !== undefined) {
			const cursorChanged = this.#cursor !== previousCursor;
			const filtersChanged = 'wantedCollections' in options || 'wantedDids' in options;
			const otherKeys = Object.keys(options).some((key) => {
				return key !== 'wantedCollections' && key !== 'wantedDids' && key !== 'cursor';
			});

			if (cursorChanged || otherKeys) {
				this.#destroy();
				this.#create();
			} else if (filtersChanged) {
				this.#sendOptionsUpdate();
			}
		}
	}
}
