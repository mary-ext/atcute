import { ComAtprotoLabelQueryLabels, ComAtprotoLabelSubscribeLabels } from '@atcute/atproto';
import type { PrivateKey } from '@atcute/crypto';
import type { Did } from '@atcute/lexicons';
import { ToolsOzoneModerationEmitEvent } from '@atcute/ozone';
import { AuthRequiredError, InvalidRequestError, type XRPCRouter, json } from '@atcute/xrpc-server';

import { SimpleEventEmitter } from '@mary-ext/simple-event-emitter';

import { formatLabel, signLabel, type CreateLabelData, type LabelSubject } from './labels.ts';
import { LabelOutbox } from './outbox.ts';
import type { LabelStore, SavedLabel } from './store.ts';

type Promisable<T> = T | Promise<T>;

/**
 * auth callback for the `emitEvent` endpoint.
 * receives the request; return `false` to reject.
 */
export type AuthCheck = (request: Request) => Promisable<boolean>;

export interface LabelerOptions {
	/** DID of the labeler account */
	did: Did;
	/** private signing key */
	key: PrivateKey;
	/** label storage backend */
	store: LabelStore;
	/** authenticate `emitEvent` requests. if not provided, the endpoint is not registered */
	auth?: AuthCheck;
	/** maximum outbox buffer size per subscription */
	maxBufferSize?: number;
}

/** labeler server core. */
export class Labeler {
	/** labeler DID */
	readonly did: Did;

	#store: LabelStore;
	#key: PrivateKey;

	#auth: AuthCheck | undefined;

	#emitter = new SimpleEventEmitter<[SavedLabel]>();
	#maxBufferSize: number;

	constructor(options: LabelerOptions) {
		this.did = options.did;

		this.#store = options.store;
		this.#key = options.key;

		this.#auth = options.auth;

		this.#maxBufferSize = options.maxBufferSize ?? 500;
	}

	/**
	 * register labeler routes on a router.
	 * registers queryLabels and subscribeLabels always;
	 * emitEvent is only registered if `auth` was provided.
	 * @param router the router to register on
	 */
	register(router: XRPCRouter): void {
		this.#registerQueryLabels(router);
		this.#registerSubscribeLabels(router);

		if (this.#auth !== undefined) {
			this.#registerEmitEvent(router, this.#auth);
		}
	}

	/**
	 * create and save a single label.
	 * @param data label creation data
	 * @returns the saved label
	 */
	async createLabel(data: CreateLabelData): Promise<SavedLabel> {
		const signed = await signLabel(data, this.did, this.#key);
		const saved = await this.#store.save(signed);

		this.#emitter.emit(saved);
		return saved;
	}

	/**
	 * create and save multiple labels for a subject.
	 * @param subject the label subject (URI + optional CID)
	 * @param labels label values to create and/or negate
	 * @returns all created labels
	 */
	async createLabels(
		subject: LabelSubject,
		labels: { create?: string[]; negate?: string[]; exp?: string },
	): Promise<SavedLabel[]> {
		const result: SavedLabel[] = [];

		if (labels.create) {
			for (const val of labels.create) {
				const saved = await this.createLabel({ ...subject, val, exp: labels.exp });
				result.push(saved);
			}
		}

		if (labels.negate) {
			for (const val of labels.negate) {
				const saved = await this.createLabel({ ...subject, val, neg: true });
				result.push(saved);
			}
		}

		return result;
	}

	#registerQueryLabels(router: XRPCRouter): void {
		const store = this.#store;

		router.addQuery(ComAtprotoLabelQueryLabels, {
			handler: async ({ params }) => {
				const result = await store.query({
					uriPatterns: params.uriPatterns,
					sources: params.sources ?? [],
					cursor: params.cursor !== undefined ? parseInt(params.cursor, 10) || 0 : 0,
					limit: params.limit,
				});

				return json(result);
			},
		});
	}

	#registerSubscribeLabels(router: XRPCRouter): void {
		const store = this.#store;
		const emitter = this.#emitter;
		const maxBufferSize = this.#maxBufferSize;

		router.addSubscription(ComAtprotoLabelSubscribeLabels, {
			async *handler({ params, signal }) {
				const { cursor } = params;

				if (cursor !== undefined) {
					const latestSeq = await store.getLatestSeq();
					if (cursor > latestSeq) {
						throw new InvalidRequestError({
							error: 'FutureCursor',
							description: `cursor is in the future`,
						});
					}
				}

				const outbox = new LabelOutbox(store, emitter, { maxBufferSize });

				for await (const label of outbox.events(cursor, signal)) {
					yield {
						$type: 'com.atproto.label.subscribeLabels#labels',
						seq: label.seq,
						labels: [formatLabel(label)],
					};
				}
			},
		});
	}

	#registerEmitEvent(router: XRPCRouter, auth: AuthCheck): void {
		router.addProcedure(ToolsOzoneModerationEmitEvent, {
			handler: async ({ request, input }) => {
				if (!(await auth(request))) {
					throw new AuthRequiredError({ description: `unauthorized` });
				}

				const { event, subject, subjectBlobCids = [], createdBy } = input;

				if (event.$type !== 'tools.ozone.moderation.defs#modEventLabel') {
					throw new InvalidRequestError({ description: `unsupported event type` });
				}

				if (!event.createLabelVals?.length && !event.negateLabelVals?.length) {
					throw new InvalidRequestError({ description: `must provide at least one label value` });
				}

				const uri =
					subject.$type === 'com.atproto.admin.defs#repoRef'
						? subject.did
						: subject.$type === 'com.atproto.repo.strongRef'
							? subject.uri
							: undefined;

				if (uri === undefined) {
					throw new InvalidRequestError({ description: `invalid subject` });
				}

				const cid = subject.$type === 'com.atproto.repo.strongRef' ? subject.cid : undefined;

				const labelSubject: LabelSubject = { uri };
				if (cid !== undefined) {
					labelSubject.cid = cid;
				}

				let exp: string | undefined;
				if (event.durationInHours !== undefined) {
					exp = new Date(Date.now() + event.durationInHours * 60 * 60 * 1000).toISOString();
				}

				const labels = await this.createLabels(labelSubject, {
					create: event.createLabelVals,
					negate: event.negateLabelVals,
					exp,
				});

				return json({
					id: labels[0]!.seq,
					event,
					subject,
					subjectBlobCids,
					createdBy,
					createdAt: new Date().toISOString(),
				});
			},
		});
	}
}
