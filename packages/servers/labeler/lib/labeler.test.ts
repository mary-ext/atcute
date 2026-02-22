import type * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import { fromBytes, isBytes } from '@atcute/cbor';
import type { PrivateKey } from '@atcute/crypto';

import { describe, expect, it } from 'vitest';

import { FutureCursorError } from './errors.ts';
import { Labeler } from './labeler.ts';
import { MemoryLabelStore } from './memory-label-store.ts';

const createTestPrivateKey = (): PrivateKey => {
	return {
		type: 'test',
		jwtAlg: 'TEST',
		async sign(data: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
			const out = new Uint8Array(8);
			for (let idx = 0; idx < data.length; idx++) {
				out[idx % out.length] = (out[idx % out.length] + data[idx] + idx) & 0xff;
			}

			return out;
		},
		async verify() {
			return true;
		},
		async exportPublicKey() {
			return 'did:key:test' as any;
		},
	} as PrivateKey;
};

const collectOne = async <T>(iterable: AsyncIterable<T>): Promise<T> => {
	const iterator = iterable[Symbol.asyncIterator]();
	const result = await iterator.next();
	if (result.done) {
		throw new Error(`iterator completed`);
	}

	return result.value;
};

describe('Labeler', () => {
	it('signs and stores labels', async () => {
		const store = new MemoryLabelStore();
		const labeler = new Labeler({
			serviceDid: 'did:plc:labeler',
			signingKey: createTestPrivateKey(),
			store: store,
		});

		const labels = await labeler.applyLabels(
			[
				{ uri: 'at://did:plc:alice/app.bsky.feed.post/1', value: 'spam' },
				{ uri: 'at://did:plc:alice/app.bsky.feed.post/1', value: 'spam', negate: true },
			],
			{ issuedAt: '2026-02-22T00:00:00Z' },
		);

		expect(labels).toHaveLength(2);
		expect(labels[0]?.src).toBe('did:plc:labeler');
		expect(labels[0]?.ver).toBe(1);
		expect(labels[1]?.neg).toBe(true);
		expect(labels.every((label) => isBytes(label.sig))).toBe(true);

		const firstSig = fromBytes(labels[0]!.sig as NonNullable<ComAtprotoLabelDefs.Label['sig']>);
		expect(firstSig.length).toBe(8);
	});

	it('returns an empty array for an empty batch', async () => {
		const labeler = new Labeler({
			serviceDid: 'did:plc:labeler',
			signingKey: createTestPrivateKey(),
			store: new MemoryLabelStore(),
		});

		await expect(labeler.applyLabels([])).resolves.toEqual([]);
	});

	it('backfills and streams live events', async () => {
		const store = new MemoryLabelStore();
		const labeler = new Labeler({
			serviceDid: 'did:plc:labeler',
			signingKey: createTestPrivateKey(),
			store: store,
		});

		await labeler.applyLabel({ uri: 'at://did:plc:alice/app.bsky.feed.post/1', value: 'spam' });

		const controller = new AbortController();
		const subscription = labeler.subscribeLabels({ cursor: 0, signal: controller.signal });
		const iterator = subscription[Symbol.asyncIterator]();

		const first = await iterator.next();
		expect(first.done).toBe(false);
		expect(first.value?.seq).toBe(1);

		const nextPromise = iterator.next();
		await labeler.applyLabel({ uri: 'at://did:plc:alice/app.bsky.feed.post/2', value: 'spam' });

		const second = await nextPromise;
		expect(second.done).toBe(false);
		expect(second.value?.seq).toBe(2);

		controller.abort();
	});

	it('rejects future subscription cursors', async () => {
		const controller = new AbortController();

		const labeler = new Labeler({
			serviceDid: 'did:plc:labeler',
			signingKey: createTestPrivateKey(),
			store: new MemoryLabelStore(),
		});

		const error = await collectOne(
			labeler.subscribeLabels({
				cursor: 1,
				signal: controller.signal,
			}),
		).catch((err) => err);

		expect(error).toBeInstanceOf(FutureCursorError);
	});

	it('tolerates sequence gaps in the store', async () => {
		const controller = new AbortController();

		const store = new MemoryLabelStore();
		store.advanceSeq(3);

		const labeler = new Labeler({
			serviceDid: 'did:plc:labeler',
			signingKey: createTestPrivateKey(),
			store: store,
		});

		await labeler.applyLabel({ uri: 'at://did:plc:alice/app.bsky.feed.post/1', value: 'spam' });

		const event = await collectOne(
			labeler.subscribeLabels({
				cursor: 0,
				signal: controller.signal,
			}),
		);

		expect(event.seq).toBe(4);
	});
});
