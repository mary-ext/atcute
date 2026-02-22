import { toBytes } from '@atcute/cbor';

import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';
import { describe, expect, it } from 'vitest';

import { ConsumerTooSlowError } from '../errors.ts';
import type { LabelEvent, LabelStore, SignedLabel } from '../types.ts';

import { LabelerOutbox } from './outbox.ts';

const makeSignedLabel = (seq: number): SignedLabel => {
	return {
		src: 'did:plc:labeler',
		uri: `at://did:plc:alice/app.bsky.feed.post/${seq}`,
		val: 'spam',
		cts: '2026-02-22T00:00:00Z',
		ver: 1,
		sig: toBytes(new Uint8Array([seq & 0xff])),
	};
};

const makeEvent = (seq: number): LabelEvent => {
	return {
		seq,
		labels: [makeSignedLabel(seq)],
	};
};

class TestStore implements LabelStore {
	#events: LabelEvent[] = [];

	onList?: (options: { after?: number; limit?: number }) => void;

	insert(event: LabelEvent): void {
		this.#events.push(event);
		this.#events.sort((a, b) => a.seq - b.seq);
	}

	insertSeqs(seqs: Iterable<number>): void {
		for (const seq of seqs) {
			this.insert(makeEvent(seq));
		}
	}

	async appendLabels(labels: SignedLabel[]): Promise<LabelEvent[]> {
		const latest = (await this.getLatestSeq()) ?? 0;
		const events: LabelEvent[] = [];

		let seq = latest;
		for (const label of labels) {
			seq++;
			const event = { seq, labels: [label] };
			this.insert(event);
			events.push(event);
		}

		return events;
	}

	async getLatestSeq(): Promise<number | null> {
		return this.#events.at(-1)?.seq ?? null;
	}

	async listLabelEvents(options: { after?: number; limit?: number }): Promise<LabelEvent[]> {
		this.onList?.(options);

		const out: LabelEvent[] = [];
		for (const event of this.#events) {
			if (options.after !== undefined && event.seq <= options.after) {
				continue;
			}

			out.push(event);
			if (options.limit !== undefined && out.length >= options.limit) {
				break;
			}
		}

		return out;
	}
}

const readSeqs = async (iterator: AsyncIterator<LabelEvent>, count: number): Promise<number[]> => {
	const seqs: number[] = [];

	for (let idx = 0; idx < count; idx++) {
		const next = await iterator.next();
		if (next.done) {
			break;
		}

		seqs.push(next.value.seq);
	}

	return seqs;
};

describe('LabelerOutbox', () => {
	it('pages through backfill across multiple reads', async () => {
		const store = new TestStore();
		store.insertSeqs([1, 2, 3, 4, 5, 6, 7, 8, 9]);

		const controller = new AbortController();
		const emitter = new SimpleEventEmitter<[event: LabelEvent]>();
		const outbox = new LabelerOutbox(store, emitter, { pageSize: 4 });
		const iterator = outbox.events(0, controller.signal);

		const seqs = await readSeqs(iterator[Symbol.asyncIterator](), 9);

		expect(seqs).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

		controller.abort();
	});

	it('handles cutover without duplicating buffered events', async () => {
		const store = new TestStore();
		store.insertSeqs([1, 2, 3]);

		const controller = new AbortController();
		const emitter = new SimpleEventEmitter<[event: LabelEvent]>();
		const outbox = new LabelerOutbox(store, emitter, { pageSize: 4 });

		let injectedCutoverEvent = false;
		store.onList = (options) => {
			if (injectedCutoverEvent || options.limit !== undefined) {
				return;
			}

			injectedCutoverEvent = true;

			const event = makeEvent(4);
			store.insert(event);
			emitter.emit(event);
		};

		const iterator = outbox.events(0, controller.signal)[Symbol.asyncIterator]();

		const seqs = await readSeqs(iterator, 4);
		expect(seqs).toEqual([1, 2, 3, 4]);

		const liveEvent = makeEvent(5);
		store.insert(liveEvent);
		emitter.emit(liveEvent);

		const next = await iterator.next();
		expect(next.done).toBe(false);
		expect(next.value?.seq).toBe(5);

		controller.abort();
	});

	it('buffers unread tail events', async () => {
		const store = new TestStore();
		const controller = new AbortController();
		const emitter = new SimpleEventEmitter<[event: LabelEvent]>();
		const outbox = new LabelerOutbox(store, emitter, { pageSize: 4, maxBufferSize: 16 });
		const iterator = outbox.events(undefined, controller.signal)[Symbol.asyncIterator]();

		const first = iterator.next();

		for (const seq of [1, 2, 3, 4, 5]) {
			emitter.emit(makeEvent(seq));
		}

		const firstResult = await first;
		expect(firstResult.done).toBe(false);
		expect(firstResult.value?.seq).toBe(1);

		const rest = await readSeqs(iterator, 4);
		expect(rest).toEqual([2, 3, 4, 5]);

		controller.abort();
	});

	it('throws when the live tail buffer overflows', async () => {
		const store = new TestStore();
		const controller = new AbortController();
		const emitter = new SimpleEventEmitter<[event: LabelEvent]>();
		const outbox = new LabelerOutbox(store, emitter, { pageSize: 4, maxBufferSize: 2 });
		const iterator = outbox.events(undefined, controller.signal)[Symbol.asyncIterator]();

		const next = iterator.next();

		for (const seq of [1, 2, 3, 4]) {
			emitter.emit(makeEvent(seq));
		}

		await expect(next).rejects.toBeInstanceOf(ConsumerTooSlowError);

		controller.abort();
	});
});
