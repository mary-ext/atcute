import * as CBOR from '@atcute/cbor';
import type { CidLink } from '@atcute/cid';
import * as CID from '@atcute/cid';
import { decodeUtf8From, encodeUtf8, toSha256 } from '@atcute/uint8array';

import { isNodeData, type NodeData, type TreeEntry } from './types.js';

export class MSTNode {
	/** @internal */
	_height: number | null | undefined;
	/** @internal */
	_cid: CidLink | undefined;
	/** @internal */
	_bytes: Uint8Array<ArrayBuffer> | undefined;

	protected constructor(
		readonly keys: readonly string[],
		readonly values: readonly CidLink[],
		readonly subtrees: readonly (CidLink | null)[],
	) {}

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

	static empty(): MSTNode {
		return new MSTNode([], [], [null]);
	}

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
			}

			const n: NodeData = {
				l: subtrees[0],
				e: e,
			};

			this._bytes = bytes = CBOR.encode(n);
		}

		return bytes;
	}

	async cid(): Promise<CidLink> {
		let cid = this._cid;
		if (cid === undefined) {
			this._cid = cid = CID.toCidLink(await CID.create(0x71, await this.serialize()));
		}

		return cid;
	}

	isEmpty(): boolean {
		return this.subtrees.length === 1 && this.subtrees[0] === null;
	}

	async height(): Promise<number | null> {
		let height = this._height;
		if (height === undefined) {
			const keys = this.keys;

			if (this.isEmpty()) {
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

	async requireHeight(): Promise<number> {
		const height = await this.height();
		if (height === null) {
			throw new Error(`indeterminate node height`);
		}

		return height;
	}

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
}

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

const commonPrefixLength = (a: string, b: string): number => {
	let idx = 0;
	for (let len = Math.min(a.length, b.length); idx < len; idx++) {
		if (a[idx] !== b[idx]) {
			break;
		}
	}

	return idx;
};
