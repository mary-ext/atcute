import type { ComAtprotoLabelDefs } from '@atcute/atproto';
import { encode, toBytes } from '@atcute/cbor';
import type { PrivateKey } from '@atcute/crypto';
import type { Did, GenericUri } from '@atcute/lexicons';

import type { SavedLabel } from './store.ts';

const LABEL_VERSION = 1;

/** data for creating a new label. */
export interface CreateLabelData {
	/** AT URI of the record, repository (account), or other resource */
	uri: string;
	/** CID specifying the version of `uri` to label */
	cid?: string;
	/** the label value */
	val: string;
	/** whether this label negates a previous label */
	neg?: boolean;
	/** creation timestamp (ISO 8601). defaults to current time */
	cts?: string;
	/** expiration timestamp (ISO 8601) */
	exp?: string;
	/** DID of the label source. defaults to the labeler's DID */
	src?: string;
}

/** subject of a label: a URI with optional CID. */
export interface LabelSubject {
	uri: string;
	cid?: string;
}

interface UnsignedLabel {
	ver: number;
	src: string;
	uri: string;
	cid?: string;
	val: string;
	neg: boolean;
	cts: string;
	exp?: string;
}

/**
 * create an unsigned label object with version and defaults.
 * @param data label creation data
 * @param src default source DID
 * @returns unsigned label ready for signing
 */
const toUnsignedLabel = (data: CreateLabelData, src: Did): UnsignedLabel => {
	const label: UnsignedLabel = {
		ver: LABEL_VERSION,
		src: data.src ?? src,
		uri: data.uri,
		val: data.val,
		neg: data.neg ?? false,
		cts: data.cts ?? new Date().toISOString(),
	};

	if (data.cid !== undefined) {
		label.cid = data.cid;
	}
	if (data.exp !== undefined) {
		label.exp = data.exp;
	}

	return label;
};

/**
 * CBOR-encode and sign a label.
 * @param data label creation data
 * @param src default source DID
 * @param key private key for signing
 * @returns the label fields and signature, ready for storage
 */
export const signLabel = async (
	data: CreateLabelData,
	src: Did,
	key: PrivateKey,
): Promise<Omit<SavedLabel, 'seq'>> => {
	const label = toUnsignedLabel(data, src);
	const bytes = encode(label);
	const sig = await key.sign(bytes);

	return {
		src: label.src,
		uri: label.uri,
		cid: label.cid,
		val: label.val,
		neg: label.neg,
		cts: label.cts,
		exp: label.exp,
		sig: sig,
	};
};

/**
 * format a saved label for wire transmission.
 * converts raw sig bytes to CBOR Bytes wrapper.
 * @param label saved label from store
 * @returns formatted label for XRPC responses
 */
export const formatLabel = (label: SavedLabel): ComAtprotoLabelDefs.Label => {
	const formatted: ComAtprotoLabelDefs.Label = {
		ver: 1,
		src: label.src as Did,
		uri: label.uri as GenericUri,
		val: label.val,
		neg: label.neg,
		cts: label.cts,
		sig: toBytes(label.sig),
	};

	if (label.cid !== undefined) {
		formatted.cid = label.cid;
	}
	if (label.exp !== undefined) {
		formatted.exp = label.exp;
	}

	return formatted;
};
