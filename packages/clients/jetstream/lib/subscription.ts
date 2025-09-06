import type { Did } from '@atcute/lexicons';

import { EventIterator } from '@mary-ext/event-iterator';
import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { WebSocket as ReconnectingWebSocket } from 'partysocket';
import type { CloseEvent, ErrorEvent, Options } from 'partysocket/ws';

import type { ReadonlyDeep } from 'type-fest';

import { jetstreamEventSchema, type JetstreamEvent, type JetstreamProcedure } from './types.js';

export interface JetstreamSubscriptionOptions {
	url: string | string[];

	cursor?: number;

	/**
	 * array of collection NSIDs that you're interested in receiving commit events
	 * for, pass in an empty array for no commit events.
	 */
	wantedCollections?: string[];
	/**
	 * array of account DIDs that you're interested in receiving commit events
	 * for, pass in an empty array for no commit events.
	 */
	wantedDids?: Did[];

	/**
	 * whether to validate Jetstream's events, you'd still need to validate the records.
	 * @default true
	 */
	validateEvents?: boolean;

	onConnectionOpen?: (event: Event) => void;
	onConnectionClose?: (event: CloseEvent) => void;
	onConnectionError?: (event: ErrorEvent) => void;

	/**
	 * WebSocket connection options
	 */
	ws?: Options;
}

const PARSE_OPTIONS = { mode: 'passthrough' } as const;

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
			const raw = JSON.parse(ev.data);

			let event: JetstreamEvent;
			if (validateEvents) {
				const result = jetstreamEventSchema.try(raw, PARSE_OPTIONS);
				if (!result.ok) {
					return;
				}

				event = result.value;
			} else {
				event = raw;
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
		this.#options = { ...this.#options, ...options };
		if (options.cursor !== undefined) {
			this.#cursor = options.cursor;
		}

		if (this.#ws !== undefined) {
			const isOptionsUpdate = Object.keys(options).every((key) => {
				return key === 'wantedCollections' || key === 'wantedDids';
			});

			if (isOptionsUpdate) {
				this.#sendOptionsUpdate();
			} else {
				this.#destroy();
				this.#create();
			}
		}
	}
}
