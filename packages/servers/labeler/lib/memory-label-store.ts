import type { LabelEvent, LabelStore, SignedLabel } from './types.ts';

/**
 * in-memory label store useful for tests and simple deployments
 */
export class MemoryLabelStore implements LabelStore {
	#events: LabelEvent[] = [];
	#latestSeq = 0;

	/**
	 * append signed labels
	 * @param labels signed labels
	 * @returns emitted events
	 */
	async appendLabels(labels: SignedLabel[]): Promise<LabelEvent[]> {
		const events: LabelEvent[] = [];

		for (const label of labels) {
			const event: LabelEvent = {
				seq: ++this.#latestSeq,
				labels: [label],
			};

			events.push(event);
			this.#events.push(event);
		}

		return events;
	}

	/**
	 * get latest sequence number
	 * @returns latest sequence, or `null`
	 */
	async getLatestSeq(): Promise<number | null> {
		return this.#latestSeq === 0 ? null : this.#latestSeq;
	}

	/**
	 * list events after a sequence cursor
	 * @param options list options
	 * @returns events in ascending order
	 */
	async listLabelEvents(options: { after?: number; limit?: number }): Promise<LabelEvent[]> {
		const { after, limit } = options;

		const events: LabelEvent[] = [];
		for (const event of this.#events) {
			if (after !== undefined && event.seq <= after) {
				continue;
			}

			events.push(event);
			if (limit !== undefined && events.length >= limit) {
				break;
			}
		}

		return events;
	}

	/**
	 * advance the sequence counter without emitting events
	 * @param count number of sequence values to skip
	 * @returns latest sequence after advancing
	 */
	advanceSeq(count = 1): number {
		this.#latestSeq += Math.max(0, Math.trunc(count));
		return this.#latestSeq;
	}
}
