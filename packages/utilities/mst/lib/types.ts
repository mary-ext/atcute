import { isBytes, type Bytes } from '@atcute/cbor';
import { isCidLink, type CidLink } from '@atcute/cid';

export interface TreeEntry {
	/** count of bytes shared with previous TreeEntry in this Node (if any) */
	p: number;
	/** remainder of key for this TreeEntry, after "prefixlen" have been removed */
	k: Bytes;
	/** link to a sub-tree Node at a lower level which has keys sorting after this TreeEntry's key (to the "right"), but before the next TreeEntry's key in this Node (if any) */
	v: CidLink;
	/** next subtree (to the right of leaf) */
	t: CidLink | null;
}

export const isTreeEntry = (value: unknown): value is TreeEntry => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.p === 'number' && isBytes(obj.k) && isCidLink(obj.v) && (obj.t === null || isCidLink(obj.t))
	);
};

export interface NodeData {
	/** link to sub-tree Node on a lower level and with all keys sorting before keys at this node */
	l: CidLink | null;
	/** ordered list of TreeEntry objects */
	e: TreeEntry[];
}

export const isNodeData = (value: unknown): value is NodeData => {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const obj = value as Record<string, unknown>;

	return (obj.l === null || isCidLink(obj.l)) && Array.isArray(obj.e) && obj.e.every(isTreeEntry);
};
