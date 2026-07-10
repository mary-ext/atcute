import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { encodeUtf8 } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { MSTNode } from './node.ts';
import type { TreeEntry } from './types.ts';

const VALUE_CID = CID.toCidLink(await CID.create(0x55, encodeUtf8('value')));

// two keys of equal height (MST nodes reject mixed-height keys), sharing a 24-byte prefix
const KEY_A = 'app.bsky.feed.post/3ka000';
const KEY_B = 'app.bsky.feed.post/3ka001';
const SHARED_PREFIX_LENGTH = 24;

const entry = (p: number, suffix: string): TreeEntry => {
	return { k: CBOR.toBytes(encodeUtf8(suffix)), p, t: null, v: VALUE_CID };
};

const serializeEntries = (entries: TreeEntry[]): Uint8Array => {
	return CBOR.encode({ e: entries, l: null });
};

describe('MSTNode.deserialize', () => {
	it('accepts a canonically prefix-compressed node', async () => {
		const bytes = serializeEntries([
			entry(0, KEY_A),
			entry(SHARED_PREFIX_LENGTH, KEY_B.slice(SHARED_PREFIX_LENGTH)),
		]);

		const node = await MSTNode.deserialize(bytes);

		expect(node.keys).toEqual([KEY_A, KEY_B]);
		// round-trips to the exact bytes it came from
		expect(await node.serialize()).toEqual(bytes);
	});

	it('rejects a negative key prefix length', async () => {
		// `prevKey.slice(0, -2)` would slice from the end, re-encoding KEY_B under a second wire form
		const bytes = serializeEntries([entry(0, KEY_A), entry(-2, KEY_B.slice(KEY_A.length - 2))]);

		await expect(MSTNode.deserialize(bytes)).rejects.toThrow(/unexpected key prefix length/);
	});

	it('rejects a fractional key prefix length', async () => {
		// `prevKey.slice(0, 1.5)` would truncate to 1
		const bytes = serializeEntries([entry(0, KEY_A), entry(1.5, KEY_B.slice(1))]);

		await expect(MSTNode.deserialize(bytes)).rejects.toThrow(/unexpected key prefix length/);
	});

	it('rejects a key prefix length past the previous key', async () => {
		const bytes = serializeEntries([entry(0, KEY_A), entry(KEY_A.length + 1, 'zzz')]);

		await expect(MSTNode.deserialize(bytes)).rejects.toThrow(/unexpected key prefix length/);
	});
});
