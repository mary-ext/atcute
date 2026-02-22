import type { ComAtprotoLabelDefs } from '@atcute/atproto';

/** label as stored in the database, with sequence number and raw sig bytes. */
export interface SavedLabel {
	/** sequence number / ID of the label */
	seq: number;
	/** DID of the actor who created this label */
	src: string;
	/** AT URI of the record, repository (account), or other resource */
	uri: string;
	/** CID specifying the version of `uri` to label */
	cid?: string;
	/** the label value */
	val: string;
	/** whether this label negates a previous label */
	neg: boolean;
	/** creation timestamp (ISO 8601) */
	cts: string;
	/** expiration timestamp (ISO 8601) */
	exp?: string;
	/** signature bytes */
	sig: Uint8Array;
}

/** parameters for querying labels. */
export interface LabelQueryParams {
	uriPatterns: string[];
	sources: string[];
	cursor: number;
	limit: number;
}

/** result of a label query. */
export interface LabelQueryResult {
	labels: ComAtprotoLabelDefs.Label[];
	cursor: string;
}

/** pluggable storage backend for labels. */
export interface LabelStore {
	/**
	 * save a signed label and assign it a sequence number.
	 * @param label the signed label to save
	 * @returns the saved label with sequence number
	 */
	save(label: Omit<SavedLabel, 'seq'>): Promise<SavedLabel>;

	/**
	 * query labels matching the given parameters.
	 * @param params query parameters
	 * @returns matching labels and cursor
	 */
	query(params: LabelQueryParams): Promise<LabelQueryResult>;

	/**
	 * get the latest sequence number.
	 * @returns the highest sequence number, or 0 if none
	 */
	getLatestSeq(): Promise<number>;

	/**
	 * get a range of labels after a given sequence number.
	 * @param after sequence number to start after (exclusive)
	 * @param limit maximum number of labels to return
	 * @returns labels in the range
	 */
	getRange(after: number, limit?: number): Promise<SavedLabel[]>;
}
