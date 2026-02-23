import type { PrivateKey } from '@atcute/crypto';
import type { Did } from '@atcute/lexicons/syntax';

import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { FutureCursorError } from './errors.ts';
import { LabelerOutbox } from './internal/outbox.ts';
import { buildLabels, signLabel } from './signing.ts';
import type {
	ApplyLabelsOptions,
	LabelerOptions,
	LabelEvent,
	LabelOp,
	LabelSubscriptionOptions,
	LabelStore,
	SignedLabel,
} from './types.ts';

/**
 * high-level labeler api with internal sequencing and subscription handling
 */
export class Labeler {
	readonly #serviceDid: Did;
	readonly #signingKey: PrivateKey;
	readonly #store: LabelStore;

	readonly #pageSize: number;

	#events = new SimpleEventEmitter<[event: LabelEvent]>();

	/**
	 * creates a new labeler
	 * @param options labeler options
	 */
	constructor(options: LabelerOptions) {
		this.#serviceDid = options.serviceDid;
		this.#signingKey = options.signingKey;
		this.#store = options.store;

		this.#pageSize = Math.max(1, options.pageSize ?? 500);
	}

	/**
	 * apply a single label operation
	 * @param op label operation
	 * @returns stored label
	 */
	async applyLabel(op: LabelOp): Promise<SignedLabel> {
		const labels = await this.applyLabels([op]);
		const label = labels[0];
		if (label === undefined) {
			throw new Error(`expected one stored label`);
		}

		return label;
	}

	/**
	 * apply label operations
	 * @param ops label operations
	 * @param options batch defaults
	 * @returns stored labels in event order
	 */
	async applyLabels(ops: Iterable<LabelOp>, options?: ApplyLabelsOptions): Promise<SignedLabel[]> {
		const drafts = buildLabels(this.#serviceDid, ops, options);
		if (drafts.length === 0) {
			return [];
		}

		const signed = await Promise.all(drafts.map((label) => signLabel(this.#signingKey, label)));
		const events = await this.#store.appendLabels(signed);

		for (const event of events) {
			this.#events.emit(event);
		}

		const labels: SignedLabel[] = [];
		for (const event of events) {
			for (const label of event.labels) {
				labels.push(label);
			}
		}

		return labels;
	}

	/**
	 * subscribe to sequenced label events
	 * @param options subscription options
	 * @returns async iterator of label events
	 * @throws {LabelerFutureCursorError}
	 */
	async *subscribeLabels(options: LabelSubscriptionOptions): AsyncIterableIterator<LabelEvent> {
		const { cursor, signal } = options;

		if (cursor !== undefined) {
			const latest = (await this.#store.getLatestSeq()) ?? 0;
			if (cursor > latest) {
				throw new FutureCursorError(cursor, latest);
			}
		}

		const outbox = new LabelerOutbox(this.#store, this.#events, { pageSize: this.#pageSize });

		yield* outbox.events(cursor, signal);
	}
}
