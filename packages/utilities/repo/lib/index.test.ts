import { writeCarStream } from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import { toBytes } from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { type CidLink, fromCidLink, toCidLink, toString } from '@atcute/cid';
import { MSTNode, type TreeEntry } from '@atcute/mst';
import { fromBase64 } from '@atcute/multibase';
import { concat, encodeUtf8 } from '@atcute/uint8array';

import { beforeAll, describe, expect, it } from 'vitest';

import { fromStream, fromUint8Array, repoEntryTransform, verifyRecord } from './index.ts';
import type { Commit } from './types.ts';
import { MAX_MST_DEPTH, MAX_NODE_ENTRIES } from './utils/mst.ts';

const suffix = (str: string): TreeEntry['k'] => toBytes(encodeUtf8(str));

/**
 * builds a minimal CAR file containing a commit, single MST node, and one record block. the MST node has two
 * entries (different keys) pointing to the same record CID.
 *
 * @param options.extraRoot append a second root CID to the CAR header (spec-legal; meaning undefined)
 */
const buildDuplicateCidCar = async (
	options: { extraRoot?: boolean } = {},
): Promise<{
	car: Uint8Array<ArrayBuffer>;
	recordCid: string;
	record: unknown;
	keys: [string, string];
}> => {
	const { extraRoot = false } = options;

	const record = { $type: 'app.bsky.feed.post', text: 'hello', createdAt: '2025-01-01T00:00:00.000Z' };
	const recordBytes = CBOR.encode(record);
	const recordCid = await CID.create(0x71, recordBytes);
	const recordLink = toCidLink(recordCid);

	// two different keys pointing to the same record CID
	const keys = ['app.bsky.feed.post/aaaa', 'app.bsky.feed.post/aaab'] as [string, string];
	const node = await MSTNode.create(keys, [recordLink, recordLink], [null, null, null]);
	const nodeBytes = await node.serialize();
	const nodeCid = fromCidLink(await node.cid());

	const commit: Commit = {
		version: 3,
		did: 'did:plc:test',
		data: await node.cid(),
		rev: '1',
		prev: null,
		sig: toBytes(new Uint8Array(64)),
	};
	const commitBytes = CBOR.encode(commit);
	const commitCid = await CID.create(0x71, commitBytes);
	const commitLink = toCidLink(commitCid);

	const chunks = await Array.fromAsync(
		writeCarStream(extraRoot ? [commitLink, toCidLink(nodeCid)] : [commitLink], [
			{ cid: commitCid.bytes, data: commitBytes },
			{ cid: nodeCid.bytes, data: nodeBytes },
			{ cid: recordCid.bytes, data: recordBytes },
		]),
	);

	return {
		car: concat(chunks),
		recordCid: toString(recordCid),
		record,
		keys,
	};
};

describe('fromUint8Array', () => {
	it('decodes atproto car files', () => {
		const buf = fromBase64(
			'OqJlcm9vdHOB2CpYJQABcRIgkD8I0DL+GsJ3OKREpf9k73yHguuSEYzEiXPGueoJg8FndmVy' +
				'c2lvbgGPAQFxEiDqG8o/D37K3hldhQTMRq9/Uvyf7X9evn9eB9ZdgpYq6qRlJHR5cGV2YXBw' +
				'LmJza3kuYWN0b3IucHJvZmlsZWljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTU6NDEuMjE5' +
				'WmtkZXNjcmlwdGlvbm90ZXN0aW5nIGFjY291bnRrZGlzcGxheU5hbWVg4AEBcRIgkD8I0DL+' +
				'GsJ3OKREpf9k73yHguuSEYzEiXPGueoJg8GmY2RpZHggZGlkOnBsYzpzcmNxb3UybTd1cXVv' +
				'Z3lkNXhrNGI1eTVjcmV2bTNsNXE1ZmplbnRjMmRjc2lnWEDeWWEO5/vV6SmnbUrLRu9WhWqI' +
				'kHKANGFOin3xqFc4fgtuYzkbFXFJDMQU06nBWxict8FQ8Kas9Mr2fDAh++vVZGRhdGHYKlgl' +
				'AAFxEiB2ibkpj3r4cdTag9v2ipIe8fxyjUFOgCjZbtYnfhyJ2GRwcmV29md2ZXJzaW9uA6QB' +
				'AXESIHaJuSmPevhx1NqD2/aKkh7x/HKNQU6AKNlu1id+HInYomFlgaRha1gbYXBwLmJza3ku' +
				'YWN0b3IucHJvZmlsZS9zZWxmYXAAYXTYKlglAAFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7p' +
				'pJX484MghY0rM2F22CpYJQABcRIg6hvKPw9+yt4ZXYUEzEavf1L8n+1/Xr5/XgfWXYKWKuph' +
				'bPaBAQFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7ppJX484MghY0rM6JhZYGkYWtYIGFwcC5i' +
				'c2t5LmZlZWQucG9zdC8za201eW1rNGhoazJ6YXAAYXT2YXbYKlglAAFxEiDj+gU903L3F3Ar' +
				'WCg+aeQZYEiM3ooIxqHbVvbQPZvEbGFs9qECAXESIOP6BT3TcvcXcCtYKD5p5BlgSIzeigjG' +
				'odtW9tA9m8RspWR0ZXh0dWJlZXAgYm9vcCBAbWFyeS5teS5pZGUkdHlwZXJhcHAuYnNreS5m' +
				'ZWVkLnBvc3RlbGFuZ3OBYmVuZmZhY2V0c4GjZSR0eXBld2FwcC5ic2t5LnJpY2h0ZXh0LmZh' +
				'Y2V0ZWluZGV4omdieXRlRW5kFWlieXRlU3RhcnQKaGZlYXR1cmVzgaJjZGlkeCBkaWQ6cGxj' +
				'OmlhNzZrdm5uZGp1dGdlZGdneDJpYnJlbWUkdHlwZXgfYXBwLmJza3kucmljaHRleHQuZmFj' +
				'ZXQjbWVudGlvbmljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTY6MjAuNjM3Wg',
		);

		const result = Array.from(fromUint8Array(buf), (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
			cid: toString(fromCidLink(entry.cid)),
			record: entry.record,
		}));

		expect(result).toEqual([
			{
				collection: 'app.bsky.actor.profile',
				rkey: 'self',
				cid: 'bafyreihkdpfd6d36zlpbsxmfatgenl37kl6j73l7l27h6xqh2zoyffrk5i',
				record: {
					$type: 'app.bsky.actor.profile',
					createdAt: '2024-02-24T12:15:41.219Z',
					displayName: '',
					description: 'testing account',
				},
			},
			{
				collection: 'app.bsky.feed.post',
				rkey: '3km5ymk4hhk2z',
				cid: 'bafyreihd7ict3u3s64lxak2yfa7gtzazmbeizxukbddkdw2w63id3g6enq',
				record: {
					$type: 'app.bsky.feed.post',
					createdAt: '2024-02-24T12:16:20.637Z',
					langs: ['en'],
					text: 'beep boop @mary.my.id',
					facets: [
						{
							$type: 'app.bsky.richtext.facet',
							index: {
								byteEnd: 21,
								byteStart: 10,
							},
							features: [
								{
									did: 'did:plc:ia76kvnndjutgedggx2ibrem',
									$type: 'app.bsky.richtext.facet#mention',
								},
							],
						},
					],
				},
			},
		]);
	});
});

describe('fromStream', () => {
	it('decodes atproto car files', async () => {
		const buf = fromBase64(
			'OqJlcm9vdHOB2CpYJQABcRIgkD8I0DL+GsJ3OKREpf9k73yHguuSEYzEiXPGueoJg8FndmVy' +
				'c2lvbgGPAQFxEiDqG8o/D37K3hldhQTMRq9/Uvyf7X9evn9eB9ZdgpYq6qRlJHR5cGV2YXBw' +
				'LmJza3kuYWN0b3IucHJvZmlsZWljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTU6NDEuMjE5' +
				'WmtkZXNjcmlwdGlvbm90ZXN0aW5nIGFjY291bnRrZGlzcGxheU5hbWVg4AEBcRIgkD8I0DL+' +
				'GsJ3OKREpf9k73yHguuSEYzEiXPGueoJg8GmY2RpZHggZGlkOnBsYzpzcmNxb3UybTd1cXVv' +
				'Z3lkNXhrNGI1eTVjcmV2bTNsNXE1ZmplbnRjMmRjc2lnWEDeWWEO5/vV6SmnbUrLRu9WhWqI' +
				'kHKANGFOin3xqFc4fgtuYzkbFXFJDMQU06nBWxict8FQ8Kas9Mr2fDAh++vVZGRhdGHYKlgl' +
				'AAFxEiB2ibkpj3r4cdTag9v2ipIe8fxyjUFOgCjZbtYnfhyJ2GRwcmV29md2ZXJzaW9uA6QB' +
				'AXESIHaJuSmPevhx1NqD2/aKkh7x/HKNQU6AKNlu1id+HInYomFlgaRha1gbYXBwLmJza3ku' +
				'YWN0b3IucHJvZmlsZS9zZWxmYXAAYXTYKlglAAFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7p' +
				'pJX484MghY0rM2F22CpYJQABcRIg6hvKPw9+yt4ZXYUEzEavf1L8n+1/Xr5/XgfWXYKWKuph' +
				'bPaBAQFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7ppJX484MghY0rM6JhZYGkYWtYIGFwcC5i' +
				'c2t5LmZlZWQucG9zdC8za201eW1rNGhoazJ6YXAAYXT2YXbYKlglAAFxEiDj+gU903L3F3Ar' +
				'WCg+aeQZYEiM3ooIxqHbVvbQPZvEbGFs9qECAXESIOP6BT3TcvcXcCtYKD5p5BlgSIzeigjG' +
				'odtW9tA9m8RspWR0ZXh0dWJlZXAgYm9vcCBAbWFyeS5teS5pZGUkdHlwZXJhcHAuYnNreS5m' +
				'ZWVkLnBvc3RlbGFuZ3OBYmVuZmZhY2V0c4GjZSR0eXBld2FwcC5ic2t5LnJpY2h0ZXh0LmZh' +
				'Y2V0ZWluZGV4omdieXRlRW5kFWlieXRlU3RhcnQKaGZlYXR1cmVzgaJjZGlkeCBkaWQ6cGxj' +
				'OmlhNzZrdm5uZGp1dGdlZGdneDJpYnJlbWUkdHlwZXgfYXBwLmJza3kucmljaHRleHQuZmFj' +
				'ZXQjbWVudGlvbmljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTY6MjAuNjM3Wg',
		);

		const blob = new Blob([buf]);
		const stream = blob.stream();

		await using repo = fromStream(stream);

		const result = await Array.fromAsync(repo, (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
			cid: toString(fromCidLink(entry.cid)),
			record: entry.record,
		}));

		expect(repo.missingBlocks).toEqual([]);

		expect(result).toEqual([
			{
				collection: 'app.bsky.actor.profile',
				rkey: 'self',
				cid: 'bafyreihkdpfd6d36zlpbsxmfatgenl37kl6j73l7l27h6xqh2zoyffrk5i',
				record: {
					$type: 'app.bsky.actor.profile',
					createdAt: '2024-02-24T12:15:41.219Z',
					displayName: '',
					description: 'testing account',
				},
			},
			{
				collection: 'app.bsky.feed.post',
				rkey: '3km5ymk4hhk2z',
				cid: 'bafyreihd7ict3u3s64lxak2yfa7gtzazmbeizxukbddkdw2w63id3g6enq',
				record: {
					$type: 'app.bsky.feed.post',
					createdAt: '2024-02-24T12:16:20.637Z',
					langs: ['en'],
					text: 'beep boop @mary.my.id',
					facets: [
						{
							$type: 'app.bsky.richtext.facet',
							index: {
								byteEnd: 21,
								byteStart: 10,
							},
							features: [
								{
									did: 'did:plc:ia76kvnndjutgedggx2ibrem',
									$type: 'app.bsky.richtext.facet#mention',
								},
							],
						},
					],
				},
			},
		]);
	});
});

describe('repoEntryTransform', () => {
	it('decodes atproto car files', async () => {
		const buf = fromBase64(
			'OqJlcm9vdHOB2CpYJQABcRIgkD8I0DL+GsJ3OKREpf9k73yHguuSEYzEiXPGueoJg8FndmVy' +
				'c2lvbgGPAQFxEiDqG8o/D37K3hldhQTMRq9/Uvyf7X9evn9eB9ZdgpYq6qRlJHR5cGV2YXBw' +
				'LmJza3kuYWN0b3IucHJvZmlsZWljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTU6NDEuMjE5' +
				'WmtkZXNjcmlwdGlvbm90ZXN0aW5nIGFjY291bnRrZGlzcGxheU5hbWVg4AEBcRIgkD8I0DL+' +
				'GsJ3OKREpf9k73yHguuSEYzEiXPGueoJg8GmY2RpZHggZGlkOnBsYzpzcmNxb3UybTd1cXVv' +
				'Z3lkNXhrNGI1eTVjcmV2bTNsNXE1ZmplbnRjMmRjc2lnWEDeWWEO5/vV6SmnbUrLRu9WhWqI' +
				'kHKANGFOin3xqFc4fgtuYzkbFXFJDMQU06nBWxict8FQ8Kas9Mr2fDAh++vVZGRhdGHYKlgl' +
				'AAFxEiB2ibkpj3r4cdTag9v2ipIe8fxyjUFOgCjZbtYnfhyJ2GRwcmV29md2ZXJzaW9uA6QB' +
				'AXESIHaJuSmPevhx1NqD2/aKkh7x/HKNQU6AKNlu1id+HInYomFlgaRha1gbYXBwLmJza3ku' +
				'YWN0b3IucHJvZmlsZS9zZWxmYXAAYXTYKlglAAFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7p' +
				'pJX484MghY0rM2F22CpYJQABcRIg6hvKPw9+yt4ZXYUEzEavf1L8n+1/Xr5/XgfWXYKWKuph' +
				'bPaBAQFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7ppJX484MghY0rM6JhZYGkYWtYIGFwcC5i' +
				'c2t5LmZlZWQucG9zdC8za201eW1rNGhoazJ6YXAAYXT2YXbYKlglAAFxEiDj+gU903L3F3Ar' +
				'WCg+aeQZYEiM3ooIxqHbVvbQPZvEbGFs9qECAXESIOP6BT3TcvcXcCtYKD5p5BlgSIzeigjG' +
				'odtW9tA9m8RspWR0ZXh0dWJlZXAgYm9vcCBAbWFyeS5teS5pZGUkdHlwZXJhcHAuYnNreS5m' +
				'ZWVkLnBvc3RlbGFuZ3OBYmVuZmZhY2V0c4GjZSR0eXBld2FwcC5ic2t5LnJpY2h0ZXh0LmZh' +
				'Y2V0ZWluZGV4omdieXRlRW5kFWlieXRlU3RhcnQKaGZlYXR1cmVzgaJjZGlkeCBkaWQ6cGxj' +
				'OmlhNzZrdm5uZGp1dGdlZGdneDJpYnJlbWUkdHlwZXgfYXBwLmJza3kucmljaHRleHQuZmFj' +
				'ZXQjbWVudGlvbmljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTY6MjAuNjM3Wg',
		);

		const blob = new Blob([buf]);
		const stream = blob.stream().pipeThrough(repoEntryTransform());

		const result = await Array.fromAsync(stream, (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
			cid: toString(fromCidLink(entry.cid)),
			record: entry.record,
		}));

		expect(result).toEqual([
			{
				collection: 'app.bsky.actor.profile',
				rkey: 'self',
				cid: 'bafyreihkdpfd6d36zlpbsxmfatgenl37kl6j73l7l27h6xqh2zoyffrk5i',
				record: {
					$type: 'app.bsky.actor.profile',
					createdAt: '2024-02-24T12:15:41.219Z',
					displayName: '',
					description: 'testing account',
				},
			},
			{
				collection: 'app.bsky.feed.post',
				rkey: '3km5ymk4hhk2z',
				cid: 'bafyreihd7ict3u3s64lxak2yfa7gtzazmbeizxukbddkdw2w63id3g6enq',
				record: {
					$type: 'app.bsky.feed.post',
					createdAt: '2024-02-24T12:16:20.637Z',
					langs: ['en'],
					text: 'beep boop @mary.my.id',
					facets: [
						{
							$type: 'app.bsky.richtext.facet',
							index: {
								byteEnd: 21,
								byteStart: 10,
							},
							features: [
								{
									did: 'did:plc:ia76kvnndjutgedggx2ibrem',
									$type: 'app.bsky.richtext.facet#mention',
								},
							],
						},
					],
				},
			},
		]);
	});
});

describe('duplicate CID handling', () => {
	it('fromUint8Array yields both records when two keys share a CID', async () => {
		const { car, recordCid, record } = await buildDuplicateCidCar();

		const result = Array.from(fromUint8Array(car), (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
			cid: toString(fromCidLink(entry.cid)),
			record: entry.record,
		}));

		expect(result).toEqual([
			{ collection: 'app.bsky.feed.post', rkey: 'aaaa', cid: recordCid, record },
			{ collection: 'app.bsky.feed.post', rkey: 'aaab', cid: recordCid, record },
		]);
	});

	it('fromStream yields both records when two keys share a CID', async () => {
		const { car, recordCid, record } = await buildDuplicateCidCar();

		const blob = new Blob([car]);
		await using repo = fromStream(blob.stream());

		const result = await Array.fromAsync(repo, (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
			cid: toString(fromCidLink(entry.cid)),
			record: entry.record,
		}));

		expect(repo.missingBlocks).toEqual([]);

		expect(result).toEqual([
			{ collection: 'app.bsky.feed.post', rkey: 'aaaa', cid: recordCid, record },
			{ collection: 'app.bsky.feed.post', rkey: 'aaab', cid: recordCid, record },
		]);
	});
});

describe('multiple roots', () => {
	it('fromUint8Array reads a car with more than one root', async () => {
		const { car } = await buildDuplicateCidCar({ extraRoot: true });

		const result = Array.from(fromUint8Array(car), (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
		}));

		expect(result).toEqual([
			{ collection: 'app.bsky.feed.post', rkey: 'aaaa' },
			{ collection: 'app.bsky.feed.post', rkey: 'aaab' },
		]);
	});

	it('fromStream reads a car with more than one root', async () => {
		const { car } = await buildDuplicateCidCar({ extraRoot: true });

		const blob = new Blob([car]);
		await using repo = fromStream(blob.stream());

		const result = await Array.fromAsync(repo, (entry) => ({
			collection: entry.collection,
			rkey: entry.rkey,
		}));

		expect(repo.missingBlocks).toEqual([]);
		expect(result).toEqual([
			{ collection: 'app.bsky.feed.post', rkey: 'aaaa' },
			{ collection: 'app.bsky.feed.post', rkey: 'aaab' },
		]);
	});
});

/**
 * builds a car with a single, hand-crafted (possibly malformed) MST node as the root's data. any additional
 * record blocks referenced by the node's entries should be passed so the walk can resolve them.
 */
const buildNodeCar = async (
	entries: TreeEntry[],
	records: { cid: Uint8Array; data: Uint8Array }[] = [],
): Promise<Uint8Array<ArrayBuffer>> => {
	const nodeBytes = CBOR.encode({ e: entries, l: null });
	const nodeCid = await CID.create(0x71, nodeBytes);

	const commit: Commit = {
		version: 3,
		did: 'did:plc:test',
		data: toCidLink(nodeCid),
		rev: '1',
		prev: null,
		sig: toBytes(new Uint8Array(64)),
	};
	const commitBytes = CBOR.encode(commit);
	const commitCid = await CID.create(0x71, commitBytes);

	const chunks = await Array.fromAsync(
		writeCarStream(
			[toCidLink(commitCid)],
			[{ cid: commitCid.bytes, data: commitBytes }, { cid: nodeCid.bytes, data: nodeBytes }, ...records],
		),
	);

	return concat(chunks);
};

describe('malformed mst nodes', () => {
	let value: CidLink;
	let record: { cid: Uint8Array; data: Uint8Array };

	beforeAll(async () => {
		const data = CBOR.encode({ $type: 'app.bsky.feed.post' });
		const cid = await CID.create(0x71, data);

		value = toCidLink(cid);
		record = { cid: cid.bytes, data };
	});

	it('rejects a key prefix length larger than the previous key', async () => {
		const car = await buildNodeCar([{ p: 5, k: suffix('app.bsky.feed.post/aaaa'), v: value, t: null }]);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/key prefix length out of range/);
		await expect(Array.fromAsync(fromStream(new Blob([car]).stream()))).rejects.toThrow(
			/key prefix length out of range/,
		);
	});

	it('rejects suboptimal (non-maximal) prefix compaction', async () => {
		const car = await buildNodeCar(
			[
				{ p: 0, k: suffix('app.bsky.feed.post/aaaa'), v: value, t: null },
				{ p: 0, k: suffix('app.bsky.feed.post/aaab'), v: value, t: null },
			],
			[record],
		);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/suboptimal key prefix length/);
		await expect(Array.fromAsync(fromStream(new Blob([car]).stream()))).rejects.toThrow(
			/suboptimal key prefix length/,
		);
	});

	it('rejects entries that are out of sort order', async () => {
		const car = await buildNodeCar(
			[
				{ p: 0, k: suffix('app.bsky.feed.post/zzzz'), v: value, t: null },
				{ p: 19, k: suffix('aaaa'), v: value, t: null },
			],
			[record],
		);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/out of order/);
		await expect(Array.fromAsync(fromStream(new Blob([car]).stream()))).rejects.toThrow(/out of order/);
	});

	it('rejects a repo path with more than two segments', async () => {
		const car = await buildNodeCar(
			[{ p: 0, k: suffix('app.bsky.feed.post/aaaa/bbbb'), v: value, t: null }],
			[record],
		);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/invalid repo path/);
		await expect(Array.fromAsync(fromStream(new Blob([car]).stream()))).rejects.toThrow(/invalid repo path/);
	});

	it('rejects a repo path with an empty record key', async () => {
		const car = await buildNodeCar([{ p: 0, k: suffix('app.bsky.feed.post/'), v: value, t: null }], [record]);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/invalid repo path/);
		await expect(Array.fromAsync(fromStream(new Blob([car]).stream()))).rejects.toThrow(/invalid repo path/);
	});
});

/** builds a car whose MST is a left-spine chain of `chainLength` nodes, bottoming out in one record entry */
const buildDeepCar = async (chainLength: number): Promise<Uint8Array<ArrayBuffer>> => {
	const recordData = CBOR.encode({ $type: 'app.bsky.feed.post' });
	const recordCid = await CID.create(0x71, recordData);

	const blocks: { cid: Uint8Array; data: Uint8Array }[] = [{ cid: recordCid.bytes, data: recordData }];

	const leafBytes = CBOR.encode({
		e: [{ k: toBytes(encodeUtf8('app.bsky.feed.post/aaaa')), p: 0, t: null, v: toCidLink(recordCid) }],
		l: null,
	});
	let childCid = await CID.create(0x71, leafBytes);
	blocks.push({ cid: childCid.bytes, data: leafBytes });

	for (let i = 0; i < chainLength; i++) {
		const nodeBytes = CBOR.encode({ e: [], l: toCidLink(childCid) });
		childCid = await CID.create(0x71, nodeBytes);
		blocks.push({ cid: childCid.bytes, data: nodeBytes });
	}

	const commit: Commit = {
		version: 3,
		did: 'did:plc:test',
		data: toCidLink(childCid),
		rev: '1',
		prev: null,
		sig: toBytes(new Uint8Array(64)),
	};
	const commitBytes = CBOR.encode(commit);
	const commitCid = await CID.create(0x71, commitBytes);

	const chunks = await Array.fromAsync(
		writeCarStream([toCidLink(commitCid)], [{ cid: commitCid.bytes, data: commitBytes }, ...blocks]),
	);
	return concat(chunks);
};

describe('resource limits', () => {
	it('rejects a tree deeper than the recursion limit', async () => {
		const car = await buildDeepCar(MAX_MST_DEPTH + 2);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/too deep/);
	});

	it('rejects a node with more entries than the limit', async () => {
		const recordData = CBOR.encode({ $type: 'app.bsky.feed.post' });
		const recordCid = await CID.create(0x71, recordData);
		const value = toCidLink(recordCid);

		const entries: TreeEntry[] = Array.from({ length: MAX_NODE_ENTRIES + 1 }, () => ({
			k: toBytes(encodeUtf8('app.bsky.feed.post/aaaa')),
			p: 0,
			t: null,
			v: value,
		}));
		const car = await buildNodeCar(entries, [{ cid: recordCid.bytes, data: recordData }]);

		expect(() => Array.from(fromUint8Array(car))).toThrow(/too many entries/);
		await expect(Array.fromAsync(fromStream(new Blob([car]).stream()))).rejects.toThrow(/too many entries/);
	});
});

describe('verifyRecord', () => {
	let value: CidLink;
	let recordData: Uint8Array;
	let recordCid: Awaited<ReturnType<typeof CID.create>>;

	beforeAll(async () => {
		recordData = CBOR.encode({ $type: 'app.bsky.feed.post', text: 'hi' });
		recordCid = await CID.create(0x71, recordData);
		value = toCidLink(recordCid);
	});

	it('returns the record for a valid inclusion proof', async () => {
		const car = await buildNodeCar(
			[{ p: 0, k: suffix('app.bsky.feed.post/aaaa'), v: value, t: null }],
			[{ cid: recordCid.bytes, data: recordData }],
		);

		const result = await verifyRecord({ carBytes: car, collection: 'app.bsky.feed.post', rkey: 'aaaa' });

		expect(result.cid).toBe(toString(recordCid));
		expect(result.record).toEqual({ $type: 'app.bsky.feed.post', text: 'hi' });
	});

	it('descends sub-trees to find a nested record', async () => {
		// buildDeepCar nests a single record at app.bsky.feed.post/aaaa beneath a chain of left sub-trees
		const car = await buildDeepCar(3);

		const result = await verifyRecord({ carBytes: car, collection: 'app.bsky.feed.post', rkey: 'aaaa' });

		expect(result.record).toEqual({ $type: 'app.bsky.feed.post' });
	});

	it('throws when the record is not present', async () => {
		const car = await buildNodeCar(
			[{ p: 0, k: suffix('app.bsky.feed.post/aaaa'), v: value, t: null }],
			[{ cid: recordCid.bytes, data: recordData }],
		);

		await expect(
			verifyRecord({ carBytes: car, collection: 'app.bsky.feed.post', rkey: 'zzzz' }),
		).rejects.toThrow(/could not find record/);
	});

	it('throws when a block does not match its cid', async () => {
		const car = await buildNodeCar(
			[{ p: 0, k: suffix('app.bsky.feed.post/aaaa'), v: value, t: null }],
			// the record block is stored under the wrong (record) cid, so its bytes will not hash to it
			[{ cid: recordCid.bytes, data: CBOR.encode({ $type: 'app.bsky.feed.post', text: 'tampered' }) }],
		);

		await expect(
			verifyRecord({ carBytes: car, collection: 'app.bsky.feed.post', rkey: 'aaaa' }),
		).rejects.toThrow(/cid does not match bytes/);
	});

	it('throws when the commit did does not match', async () => {
		const car = await buildNodeCar(
			[{ p: 0, k: suffix('app.bsky.feed.post/aaaa'), v: value, t: null }],
			[{ cid: recordCid.bytes, data: recordData }],
		);

		await expect(
			verifyRecord({
				carBytes: car,
				collection: 'app.bsky.feed.post',
				rkey: 'aaaa',
				did: 'did:plc:someoneelse',
			}),
		).rejects.toThrow(/did in commit does not match/);
	});
});
