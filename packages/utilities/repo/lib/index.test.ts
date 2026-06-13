import { writeCarStream } from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import { toBytes } from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { fromCidLink, toCidLink, toString } from '@atcute/cid';
import { MSTNode } from '@atcute/mst';
import { fromBase64 } from '@atcute/multibase';
import { concat } from '@atcute/uint8array';

import { describe, expect, it } from 'vitest';

import { fromStream, fromUint8Array, repoEntryTransform } from './index.ts';
import type { Commit } from './types.ts';

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
