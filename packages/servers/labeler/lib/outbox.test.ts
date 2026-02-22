import { XRPCSubscriptionError } from '@atcute/xrpc-server';

import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';
import { describe, expect, it } from 'vitest';

import { AsyncBuffer, AsyncBufferFullError } from './async-buffer.ts';
import { LabelOutbox } from './outbox.ts';
import type { LabelStore, SavedLabel } from './store.ts';

const makeSavedLabel = (seq: number): SavedLabel => ({
	seq,
	src: 'did:plc:labeler',
	uri: 'did:plc:target',
	val: 'spam',
	neg: false,
	cts: new Date().toISOString(),
	sig: new Uint8Array(64),
});

const createMockStore = (labels: SavedLabel[] = []): LabelStore => {
	return {
		async save(label) {
			const seq = labels.length + 1;
			const saved = { ...label, seq };
			labels.push(saved);
			return saved;
		},
		async query() {
			return { labels: [], cursor: '0' };
		},
		async getLatestSeq() {
			return labels.at(-1)?.seq ?? 0;
		},
		async getRange(after, limit) {
			const result = labels.filter((l) => l.seq > after);
			return limit !== undefined ? result.slice(0, limit) : result;
		},
	};
};

describe('AsyncBuffer', () => {
	it('should throw AsyncBufferFullError on overflow', async () => {
		const buffer = new AsyncBuffer<number>(2);

		// push 4 items (exceeding max of 2)
		buffer.push(1);
		buffer.push(2);
		buffer.push(3);
		buffer.push(4);

		const collected: number[] = [];

		await expect(async () => {
			for await (const value of buffer.events()) {
				collected.push(value);
			}
		}).rejects.toThrow(AsyncBufferFullError);
	});
});

describe('LabelOutbox', () => {
	it('should backfill from cursor', async () => {
		const labels = Array.from({ length: 5 }, (_, i) => makeSavedLabel(i + 1));
		const store = createMockStore(labels);
		const emitter = new SimpleEventEmitter<[SavedLabel]>();

		const outbox = new LabelOutbox(store, emitter);
		const ac = new AbortController();

		const collected: SavedLabel[] = [];

		setTimeout(() => ac.abort(), 100);

		for await (const label of outbox.events(0, ac.signal)) {
			collected.push(label);
			if (collected.length === 5) {
				ac.abort();
				break;
			}
		}

		expect(collected).toHaveLength(5);
		expect(collected.map((l) => l.seq)).toEqual([1, 2, 3, 4, 5]);
	});

	it('should tail live events with no cursor', async () => {
		const store = createMockStore();
		const emitter = new SimpleEventEmitter<[SavedLabel]>();

		const outbox = new LabelOutbox(store, emitter);
		const ac = new AbortController();

		const collected: SavedLabel[] = [];

		const iter = outbox.events(undefined, ac.signal);

		// emit after a tick so the outbox is tailing
		queueMicrotask(() => {
			emitter.emit(makeSavedLabel(1));
		});

		for await (const label of iter) {
			collected.push(label);
			if (collected.length === 1) {
				ac.abort();
				break;
			}
		}

		expect(collected).toHaveLength(1);
		expect(collected[0]!.seq).toBe(1);
	});

	it('should backfill then tail live events', async () => {
		const labels = [makeSavedLabel(1), makeSavedLabel(2)];
		const store = createMockStore(labels);
		const emitter = new SimpleEventEmitter<[SavedLabel]>();

		const outbox = new LabelOutbox(store, emitter);
		const ac = new AbortController();

		const collected: SavedLabel[] = [];

		// emit a new label shortly after start so the outbox picks it up during tailing
		setTimeout(() => {
			emitter.emit(makeSavedLabel(3));
		}, 20);

		for await (const label of outbox.events(0, ac.signal)) {
			collected.push(label);
			if (collected.length === 3) {
				ac.abort();
				break;
			}
		}

		expect(collected.map((l) => l.seq)).toEqual([1, 2, 3]);
	});

	it('should stop on abort signal', async () => {
		const store = createMockStore();
		const emitter = new SimpleEventEmitter<[SavedLabel]>();

		const outbox = new LabelOutbox(store, emitter);
		const ac = new AbortController();

		const collected: SavedLabel[] = [];

		setTimeout(() => ac.abort(), 50);

		for await (const label of outbox.events(undefined, ac.signal)) {
			collected.push(label);
		}

		expect(collected).toHaveLength(0);
	});

	it('should wrap AsyncBufferFullError as ConsumerTooSlow', async () => {
		const store = createMockStore();
		const emitter = new SimpleEventEmitter<[SavedLabel]>();

		const outbox = new LabelOutbox(store, emitter, { maxBufferSize: 2 });
		const ac = new AbortController();

		let error: unknown;
		const done = (async () => {
			try {
				for await (const _label of outbox.events(undefined, ac.signal)) {
					// stall the consumer — don't break, just wait for more
					// while the producer floods the buffer below
					await new Promise((resolve) => setTimeout(resolve, 50));
				}
			} catch (err) {
				error = err;
			}
		})();

		// wait for the outbox to start tailing
		await new Promise((resolve) => setTimeout(resolve, 10));

		// flood the buffer well beyond capacity
		for (let i = 1; i <= 10; i++) {
			emitter.emit(makeSavedLabel(i));
		}

		await done;

		expect(error).toBeInstanceOf(XRPCSubscriptionError);
		expect((error as XRPCSubscriptionError).error).toBe('ConsumerTooSlow');
	});
});
