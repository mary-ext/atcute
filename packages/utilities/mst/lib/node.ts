import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';
import { decodeUtf8From, encodeUtf8, toSha256 } from '@atcute/uint8array';

import { isNodeData, type NodeData, type TreeEntry } from './types.js';

/**
 * represents a node in a Merkle Search Tree (MST)
 * stores sorted keys, their associated values (CIDs), and subtree pointers
 */
export class MSTNode {
	/**
	 * cached height of this node in the tree
	 * @internal
	 */
	_height: number | null | undefined;
	/**
	 * cached CID for this node
	 * @internal
	 */
	_cid: CidLink | undefined;
	/**
	 * cached serialized bytes for this node
	 * @internal
	 */
	_bytes: Uint8Array<ArrayBuffer> | undefined;

	protected constructor(
		/** sorted array of keys stored in this node */
		readonly keys: readonly string[],
		/** array of value CIDs corresponding to each key */
		readonly values: readonly CidLink[],
		/** array of subtree CIDs (length is keys.length + 1) */
		readonly subtrees: readonly (CidLink | null)[],
	) {}

	/**
	 * creates a new MST node with validation
	 * @param keys sorted array of keys
	 * @param values array of value CIDs corresponding to keys
	 * @param subtrees array of subtree CIDs (length must be keys.length + 1)
	 * @returns a new validated MST node
	 * @throws {TypeError} if node structure is invalid or keys have inconsistent heights
	 */
	static async create(
		keys: readonly string[],
		values: readonly CidLink[],
		subtrees: readonly (CidLink | null)[],
	): Promise<MSTNode> {
		if (subtrees.length !== keys.length + 1) {
			throw new TypeError(`malformed MST node; invalid subtree count`);
		}

		if (keys.length !== values.length) {
			throw new TypeError(`malformed MST node; mismatched keys/values lengths`);
		}

		let expectedHeight: number | undefined;
		for (const key of keys) {
			const height = await getKeyHeight(key);
			expectedHeight ??= height;

			if (height !== expectedHeight) {
				throw new TypeError(`malformed MST node; inconsistent key heights`);
			}
		}

		return new MSTNode(keys, values, subtrees);
	}

	/**
	 * creates an empty MST node
	 * @returns a new empty node
	 */
	static empty(): MSTNode {
		return new MSTNode([], [], [null]);
	}

	/**
	 * deserializes an MST node from CBOR-encoded bytes
	 * @param bytes the CBOR-encoded node data
	 * @returns the deserialized MST node
	 * @throws {TypeError} if the bytes don't represent a valid MST node
	 */
	static async deserialize(bytes: Uint8Array): Promise<MSTNode> {
		const node = CBOR.decode(bytes);
		if (!isNodeData(node)) {
			throw new TypeError(`malformed MST node; invalid structure`);
		}

		const keys: string[] = [];
		const values: CidLink[] = [];
		const subtrees: (CidLink | null)[] = [node.l];

		let prevKey = '';

		for (const entry of node.e) {
			const prefixLen = entry.p;
			if (prefixLen > prevKey.length) {
				throw new TypeError(`malformed MST node; unexpected key prefix length`);
			}

			const suffix = decodeUtf8From(CBOR.fromBytes(entry.k));
			if (prevKey[prefixLen] === suffix[0]) {
				throw new TypeError(`malformed MST node; suboptimal key prefix length`);
			}

			const key = prevKey.slice(0, prefixLen) + suffix;
			if (key <= prevKey) {
				throw new TypeError(`malformed MST node; invalid key sort order`);
			}

			keys.push(key);
			values.push(entry.v);
			subtrees.push(entry.t);

			prevKey = key;
		}

		return await MSTNode.create(keys, values, subtrees);
	}

	/**
	 * serializes the node to CBOR-encoded bytes with prefix compression
	 * @returns the CBOR-encoded node data
	 */
	async serialize(): Promise<Uint8Array<ArrayBuffer>> {
		let bytes = this._bytes;
		if (bytes === undefined) {
			const keys = this.keys;
			const values = this.values;
			const subtrees = this.subtrees;

			const e: TreeEntry[] = [];

			let prevKey = '';

			for (let idx = 0, len = keys.length; idx < len; idx++) {
				const key = keys[idx];
				const prefixLen = commonPrefixLength(prevKey, key);
				const suffix = key.slice(prefixLen);

				e.push({
					k: CBOR.toBytes(encodeUtf8(suffix)),
					p: prefixLen,
					t: subtrees[idx + 1],
					v: values[idx],
				});

				prevKey = key;
			}

			const n: NodeData = {
				l: subtrees[0],
				e: e,
			};

			this._bytes = bytes = CBOR.encode(n);
		}

		return bytes;
	}

	/**
	 * whether the node is empty (no keys or values)
	 */
	get isEmpty(): boolean {
		return this.subtrees.length === 1 && this.subtrees[0] === null;
	}

	/**
	 * computes the CID for this node
	 * @returns the CID link for this node
	 */
	async cid(): Promise<CidLink> {
		let cid = this._cid;
		if (cid === undefined) {
			this._cid = cid = CID.toCidLink(await CID.create(0x71, await this.serialize()));
		}

		return cid;
	}

	/**
	 * computes the height of this node in the MST
	 * @returns the height, or null if indeterminate (empty intermediate node)
	 */
	async height(): Promise<number | null> {
		let height = this._height;
		if (height === undefined) {
			const keys = this.keys;

			if (this.isEmpty) {
				height = 0;
			} else if (keys.length > 0) {
				height = await getKeyHeight(keys[0]);
			} else {
				height = null;
			}

			this._height = height;
		}

		return height;
	}

	/**
	 * gets the node height, throwing if indeterminate
	 * @returns the height
	 * @throws {Error} if height cannot be determined
	 */
	async requireHeight(): Promise<number> {
		const height = await this.height();
		if (height === null) {
			throw new Error(`indeterminate node height`);
		}

		return height;
	}

	/**
	 * finds the index of the first key >= the given key
	 * @param key the key to search for
	 * @returns the index of the lower bound
	 */
	lowerBound(key: string): number {
		const keys = this.keys;
		const len = keys.length;

		for (let idx = 0; idx < len; idx++) {
			if (key <= keys[idx]) {
				return idx;
			}
		}

		return len;
	}

	/**
	 * returns the node's CID if it's not empty, null otherwise
	 * @returns the CID or null
	 * @internal
	 */
	async _toNullable(): Promise<CidLink | null> {
		if (this.isEmpty) {
			return null;
		}
		return await this.cid();
	}
}

/**
 * computes the MST height for a given key by counting leading zeros in its hash
 * @param key the key to compute height for
 * @returns the height (number of leading zero bits in 2-bit chunks)
 */
export const getKeyHeight = async (key: string): Promise<number> => {
	const hash = await toSha256(encodeUtf8(key));

	let lz = 0;
	for (let idx = 0, len = hash.length; idx < len; idx++) {
		const byte = hash[idx];

		if (byte < 64) {
			lz++;
		}
		if (byte < 16) {
			lz++;
		}
		if (byte < 4) {
			lz++;
		}

		if (byte === 0) {
			lz++;
		} else {
			break;
		}
	}

	return lz;
};

/**
 * computes the length of the common prefix between two strings
 * @param a first string
 * @param b second string
 * @returns length of common prefix
 */
const commonPrefixLength = (a: string, b: string): number => {
	let idx = 0;
	for (let len = Math.min(a.length, b.length); idx < len; idx++) {
		if (a[idx] !== b[idx]) {
			break;
		}
	}

	return idx;
};
