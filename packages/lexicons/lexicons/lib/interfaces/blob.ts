import type { Cid } from '../syntax/cid.ts';

import { isCidLink, type CidLink } from './cid-link.ts';

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

/**
 * extracted blob reference from a record
 */
export interface BlobRef {
	/** CID string */
	cid: string;
	mimeType: string;
	/** self-reported size. -1 for legacy blobs */
	size: number;
}

export interface CollectBlobsOptions {
	/** include legacy blob references in results (default: false) */
	allowLegacy?: boolean;
}

/**
 * extracts all blob references from a record object, including in undeclared
 * properties. by default only finds modern blobs; set `allowLegacy` to also
 * include legacy blob formats.
 * @param record record object to walk
 * @param options collection options
 * @returns array of blob references found
 */
export const collectBlobs = (record: unknown, options?: CollectBlobsOptions): BlobRef[] => {
	const allowLegacy = options?.allowLegacy === true;
	const blobs: BlobRef[] = [];
	const stack: unknown[] = [record];
	const visited = new Set<object>();

	while (stack.length > 0) {
		const value = stack.pop();

		if (typeof value !== 'object' || value === null) {
			continue;
		}
		if (visited.has(value)) {
			continue;
		}
		visited.add(value);

		if (Array.isArray(value)) {
			for (let i = value.length - 1; i >= 0; i--) {
				stack.push(value[i]);
			}
			continue;
		}

		if (isBlob(value)) {
			blobs.push({
				cid: value.ref.$link,
				mimeType: value.mimeType,
				size: value.size,
			});
			continue;
		}

		if (allowLegacy && isLegacyBlob(value)) {
			blobs.push({
				cid: value.cid,
				mimeType: value.mimeType,
				size: -1,
			});
			continue;
		}

		const keys = Object.keys(value);
		for (let i = keys.length - 1; i >= 0; i--) {
			const v = (value as Record<string, unknown>)[keys[i]];
			if (v != null) {
				stack.push(v);
			}
		}
	}

	return blobs;
};
