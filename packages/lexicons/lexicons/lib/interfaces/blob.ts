import type { Cid } from '../syntax/cid.js';

import { isCidLink, type CidLink } from './cid-link.js';

/**
 * represents a reference to a data blob
 */
export interface Blob<TMime extends string = string> {
	$type: 'blob';
	mimeType: TMime;
	ref: CidLink;
	size: number;
}

export const isBlob = (input: unknown): input is Blob => {
	const v = input as any;

	return (
		typeof v === 'object' &&
		v !== null &&
		v.$type === 'blob' &&
		typeof v.mimeType === 'string' &&
		Number.isSafeInteger(v.size) &&
		isCidLink(v.ref) &&
		Object.keys(v).length === 4
	);
};

/**
 * deprecated interface representing an interface to a data blob
 */
export interface LegacyBlob<TMime extends string = string> {
	cid: Cid;
	mimeType: TMime;
}

export const isLegacyBlob = (input: unknown): input is LegacyBlob => {
	const v = input as any;

	return (
		typeof v === 'object' &&
		v !== null &&
		typeof v.cid === 'string' &&
		typeof v.mimeType === 'string' &&
		Object.keys(v).length === 2
	);
};
