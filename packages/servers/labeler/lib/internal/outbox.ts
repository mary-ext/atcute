import { type SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { ConsumerTooSlowError } from '../errors.ts';
import type { LabelEvent, LabelStore } from '../types.ts';

import { AsyncBufferFullError } from './async-buffer.ts';
import { on } from './on.ts';

interface LabelerOutboxOptions {
	pageSize: number;
	maxBufferSize?: number;
}

/** internal helper that merges store backfill with local wake-ups */
export class LabelerOutbox {
	#store: LabelStore;
	#events: SimpleEventEmitter<[event: LabelEvent]>;
	#pageSize: number;
	#maxBufferSize: number;

	/**
	 * creates an outbox
	 *
	 * @param store label store
	 * @param wakeups local wakeup emitter
	 * @param options outbox options
	 */
	constructor(
		store: LabelStore,
		events: SimpleEventEmitter<[event: LabelEvent]>,
		options: LabelerOutboxOptions,
	) {
		this.#store = store;
		this.#events = events;
		this.#pageSize = options.pageSize;
		this.#maxBufferSize = Math.max(1, options.maxBufferSize ?? 64);
	}

	async *events(backfillCursor: number | undefined, signal: AbortSignal): AsyncIterableIterator<LabelEvent> {
		let lastBackfillSeq = -1;
		let caughtUp = backfillCursor === undefined;

		// consumer is backfilling, dump everything we have
		if (!caughtUp) {
			while (true) {
				const events = await this.#store.listLabelEvents({
					after: lastBackfillSeq > -1 ? lastBackfillSeq : backfillCursor,
					limit: this.#pageSize,
				});

				if (events.length === 0) {
					break;
				}

				yield* events;

				signal.throwIfAborted();

				lastBackfillSeq = events.at(-1)!.seq;

				// stop when we're within half a page of the latest known seq
				const lastSeq = (await this.#store.getLatestSeq()) ?? -1;
				if (lastSeq - lastBackfillSeq < this.#pageSize / 2) {
					break;
				}
			}

			signal.throwIfAborted();
		}

		// start listening to local labeler events
		const tail = on(this.#events, { signal, maxSize: this.#maxBufferSize });

		// ensure we're truly caught up
		if (!caughtUp) {
			const events = await this.#store.listLabelEvents({
				after: lastBackfillSeq > -1 ? lastBackfillSeq : backfillCursor,
			});

			if (events.length > 0) {
				yield* events;

				signal.throwIfAborted();

				lastBackfillSeq = events.at(-1)!.seq;
			}
		}

		// start tailing
		try {
			for await (const event of tail) {
				if (!caughtUp) {
					// we're tailing now, but we still have to omit previous events
					if (event.seq <= lastBackfillSeq) {
						continue;
					}

					caughtUp = true;
				}

				yield event;
			}
		} catch (err) {
			if (err instanceof AsyncBufferFullError) {
				throw new ConsumerTooSlowError();
			}

			throw err;
		}
	}
}
