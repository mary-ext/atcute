import type * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import type { PrivateKey } from '@atcute/crypto';
import type { GenericUri } from '@atcute/lexicons';

/**
 * a label with a required signature
 */
export type SignedLabel = Omit<ComAtprotoLabelDefs.Label, 'sig'> & {
	sig: NonNullable<ComAtprotoLabelDefs.Label['sig']>;
};

/**
 * a signed label event with a monotonically increasing sequence number
 */
export interface LabelEvent {
	seq: number;
	labels: SignedLabel[];
}

/**
 * a single label operation before the labeler fills in service metadata and signs
 */
export interface LabelOp {
	uri: GenericUri;
	cid?: string;
	value: string;
	negate?: boolean;
	issuedAt?: string;
	expiresAt?: string;
}

/**
 * defaults applied to a batch of label operations
 */
export interface ApplyLabelsOptions {
	issuedAt?: string;
	expiresAt?: string;
}

/**
 * options for subscribing to label events
 */
export interface LabelSubscriptionOptions {
	cursor?: number;
	signal: AbortSignal;
}

/**
 * persistence backend used by `Labeler`
 */
export interface LabelStore {
	/**
	 * append signed labels to the store and return emitted events in sequence order
	 * @param labels signed labels to persist
	 * @returns emitted label events
	 */
	appendLabels(labels: SignedLabel[]): Promise<LabelEvent[]>;

	/**
	 * get the latest known sequence number
	 * @returns latest sequence, or `null` if empty
	 */
	getLatestSeq(): Promise<number | null>;

	/**
	 * list events after a cursor in ascending sequence order
	 * @param options list options
	 * @returns label events
	 */
	listLabelEvents(options: { after?: number; limit?: number }): Promise<LabelEvent[]>;
}

/**
 * options for constructing a labeler
 */
export interface LabelerOptions {
	serviceDid: ComAtprotoLabelDefs.Label['src'];
	signingKey: PrivateKey;
	store: LabelStore;
	pageSize?: number;
}
