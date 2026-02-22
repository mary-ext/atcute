import { XRPCSubscriptionError } from '@atcute/xrpc-server';

import type { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { AsyncBufferFullError, on } from './async-buffer.ts';
import type { LabelStore, SavedLabel } from './store.ts';

const BACKFILL_PAGE_SIZE = 500;

export interface LabelOutboxOptions {
	maxBufferSize?: number;
}

/**
 * outbox for streaming labels with push-pull semantics.
 *
 * handles backfill from cursor, catch-up, and live tailing
 * with backpressure via bounded async buffer.
 */
export class LabelOutbox {
	#store: LabelStore;
	#emitter: SimpleEventEmitter<[label: SavedLabel]>;
	#maxBufferSize: number;

	constructor(
		store: LabelStore,
		emitter: SimpleEventEmitter<[label: SavedLabel]>,
		options: LabelOutboxOptions = {},
	) {
		this.#store = store;
		this.#emitter = emitter;
		this.#maxBufferSize = options.maxBufferSize ?? 500;
	}

	/**
	 * stream labels, optionally backfilling from a cursor.
	 * @param cursor sequence number to backfill from (exclusive), or undefined for live-only
	 * @param signal abort signal to stop streaming
	 * @returns async iterator of saved labels
	 */
	async *events(cursor: number | undefined, signal: AbortSignal): AsyncGenerator<SavedLabel> {
		let lastBackfillSeq = -1;
		let caughtUp = cursor === undefined;

		// backfill phase: dump stored labels in pages
		if (!caughtUp) {
			while (true) {
				const events = await this.#store.getRange(
					lastBackfillSeq > -1 ? lastBackfillSeq : cursor!,
					BACKFILL_PAGE_SIZE,
				);

				if (events.length === 0) {
					break;
				}

				yield* events;
				signal.throwIfAborted();

				lastBackfillSeq = events.at(-1)!.seq;

				// stop when close to the head
				const latestSeq = await this.#store.getLatestSeq();
				if (latestSeq - lastBackfillSeq < BACKFILL_PAGE_SIZE / 2) {
					break;
				}
			}

			signal.throwIfAborted();
		}

		// start listening before reading the gap
		const tail = on(this.#emitter, { signal, maxSize: this.#maxBufferSize });

		// catch-up phase: read any labels between backfill end and tail start
		if (!caughtUp) {
			const events = await this.#store.getRange(lastBackfillSeq > -1 ? lastBackfillSeq : cursor!);

			if (events.length > 0) {
				yield* events;
				signal.throwIfAborted();

				lastBackfillSeq = events.at(-1)!.seq;
			}
		}

		// tail phase: stream live events, deduplicating the catch-up overlap
		try {
			for await (const event of tail) {
				if (!caughtUp) {
					if (event.seq <= lastBackfillSeq) {
						continue;
					}

					caughtUp = true;
				}

				yield event;
			}
		} catch (err) {
			if (err instanceof AsyncBufferFullError) {
				throw new XRPCSubscriptionError({
					error: 'ConsumerTooSlow',
					description: `stream consumer too slow`,
				});
			}

			throw err;
		}
	}
}
