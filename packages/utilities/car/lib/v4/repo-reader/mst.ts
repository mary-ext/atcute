import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';

const isCidLink = (value: unknown): value is CID.CidLink => {
	if (value instanceof CID.CidLinkWrapper) {
		return true;
	}

	if (value === null || typeof value !== 'object') {
		return false;
	}

	return '$link' in value && typeof value.$link === 'string';
};

const isBytes = (value: unknown): value is CBOR.Bytes => {
	if (value instanceof CBOR.BytesWrapper) {
		return true;
	}

	if (value === null || typeof value !== 'object') {
		return false;
	}

	return '$bytes' in value && typeof value.$bytes === 'string';
};

/** commit object */
export interface Commit {
	version: 3;
	did: string;
	data: CID.CidLink;
	rev: string;
	prev: CID.CidLink | null;
	sig: CBOR.Bytes;
}

/**
 * checks if a value is a valid commit object
 * @param value the value to check
 * @returns true if the value is a valid commit object, false otherwise
 */
export const isCommit = (value: unknown): value is Commit => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		obj.version === 3 &&
		typeof obj.did === 'string' &&
		isCidLink(obj.data) &&
		typeof obj.rev === 'string' &&
		(obj.prev === null || isCidLink(obj.prev)) &&
		isBytes(obj.sig)
	);
};

/** mst tree entry object */
export interface TreeEntry {
	/** count of bytes shared with previous TreeEntry in this Node (if any) */
	p: number;
	/** remainder of key for this TreeEntry, after "prefixlen" have been removed */
	k: CBOR.Bytes;
	/** link to a sub-tree Node at a lower level which has keys sorting after this TreeEntry's key (to the "right"), but before the next TreeEntry's key in this Node (if any) */
	v: CID.CidLink;
	/** next subtree (to the right of leaf) */
	t: CID.CidLink | null;
}

/**
 * checks if a value is a valid mst tree entry object
 * @param value the value to check
 * @returns true if the value is a valid mst tree entry object, false otherwise
 */
export const isTreeEntry = (value: unknown): value is TreeEntry => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.p === 'number' && isBytes(obj.k) && isCidLink(obj.v) && (obj.t === null || isCidLink(obj.t))
	);
};

/** mst node object */
export interface MstNode {
	/** link to sub-tree Node on a lower level and with all keys sorting before keys at this node */
	l: CID.CidLink | null;
	/** ordered list of TreeEntry objects */
	e: TreeEntry[];
}

/**
 * checks if a value is a valid mst node object
 * @param value the value to check
 * @returns true if the value is a valid mst node object, false otherwise
 */
export const isMstNode = (value: unknown): value is MstNode => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.l === null || isCidLink(obj.l)) && Array.isArray(obj.e) && obj.e.every(isTreeEntry);
};
