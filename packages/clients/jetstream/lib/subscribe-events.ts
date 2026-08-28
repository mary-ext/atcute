import {
	FirehoseSubscription,
	type FirehoseSubscriptionOptions,
	type MessageOf,
	type ParamsOf,
} from '@atcute/firehose';
import type { Did } from '@atcute/lexicons';

import { type CursorStore, memoryCursorStore } from './cursor.ts';
import { mainSchema as subscribeEventsSchema } from './lexicons/types/network/bsky/jetstream/subscribeEvents.ts';

type SubscribeEventsFrame = MessageOf<typeof subscribeEventsSchema>;
type SubscribeEventsParams = ParamsOf<typeof subscribeEventsSchema>;

export type SubscribeEventsInfo = Extract<
	SubscribeEventsFrame,
	{ $type?: 'network.bsky.jetstream.subscribeEvents#info' }
>;

export type SubscribeEventsMessage = Exclude<SubscribeEventsFrame, SubscribeEventsInfo>;

type ForwardedOptions = Pick<
	FirehoseSubscriptionOptions<typeof subscribeEventsSchema>,
	| 'onConnectionClose'
	| 'onConnectionError'
	| 'onConnectionOpen'
	| 'onError'
	| 'signal'
	| 'validateEvents'
	| 'ws'
>;

export interface SubscribeEventsOptions extends ForwardedOptions {
	/** Jetstream service URL. */
	service: string;

	/** collection NSIDs or `<prefix>.*` patterns for commit events. */
	collections?: string[];
	/** repo DIDs to receive events for. */
	dids?: Did[];
	/** event kinds to receive. */
	kinds?: SubscribeEventsParams['kinds'];

	/** sequence, v1 timestamp cursor, or cursor store to resume from. */
	cursor?: CursorStore | number;
	/**
	 * minimum milliseconds between cursor store writes. `0` saves every event.
	 *
	 * @default 5_000
	 */
	cursorSaveInterval?: number;

	/** maximum uncompressed frame size accepted by the server. */
	maxMessageSizeBytes?: SubscribeEventsParams['maxMessageSizeBytes'];

	/** called for stream advisories. */
	onInfo?: (info: SubscribeEventsInfo) => void;
}

/**
 * subscribes to the Jetstream v2 live tail.
 *
 * @param options subscription options
 * @returns events in sequence order
 * @throws the abort reason or a cursor store error
 */
export const subscribeEvents = async function* (
	options: SubscribeEventsOptions,
): AsyncGenerator<SubscribeEventsMessage, void, void> {
	const {
		collections,
		cursor,
		cursorSaveInterval = 5_000,
		dids,
		kinds,
		maxMessageSizeBytes,
		onInfo,
		service,
		...forwarded
	} = options;

	const store = typeof cursor === 'object' ? cursor : memoryCursorStore(cursor);

	let lastSeq: number | undefined;
	let unsavedSeq: number | undefined;
	let lastSavedAt = 0;

	let saving = Promise.resolve();

	const save = async (): Promise<void> => {
		const seq = unsavedSeq;
		if (seq === undefined) {
			return;
		}

		unsavedSeq = undefined;

		await store.save(seq);
		lastSavedAt = Date.now();
	};

	const flush = (): Promise<void> => {
		return (saving = saving.then(save, save));
	};

	const subscription = new FirehoseSubscription({
		...forwarded,
		service,
		nsid: subscribeEventsSchema,
		params: async () => {
			// keep the store authoritative
			await flush();
			lastSeq = await store.load();

			return {
				collections,
				cursor: lastSeq,
				dids,
				kinds,
				maxMessageSizeBytes,
			};
		},
	});

	try {
		for await (const frame of subscription) {
			switch (frame.$type) {
				case 'network.bsky.jetstream.subscribeEvents#account':
				case 'network.bsky.jetstream.subscribeEvents#commit':
				case 'network.bsky.jetstream.subscribeEvents#identity':
				case 'network.bsky.jetstream.subscribeEvents#sync': {
					break;
				}

				case 'network.bsky.jetstream.subscribeEvents#info': {
					onInfo?.(frame);
					continue;
				}

				default: {
					// preserve the cursor for unsupported events
					continue;
				}
			}

			const seq = frame.seq;
			if (lastSeq !== undefined && seq <= lastSeq) {
				continue;
			}

			lastSeq = seq;
			yield frame;

			unsavedSeq = seq;

			if (Date.now() - lastSavedAt < cursorSaveInterval) {
				continue;
			}

			await flush();
		}
	} finally {
		try {
			await flush();
		} catch (err) {
			// don't mask the iteration error
			forwarded.onError?.(err);
		}
	}
};
