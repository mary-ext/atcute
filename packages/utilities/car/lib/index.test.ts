import { expect, it } from 'bun:test';

import { iterateAtpRepo } from './index.js';

it('decodes atproto car files', () => {
	const buf = Buffer.from(
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
			'ZXQjbWVudGlvbmljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTY6MjAuNjM3Wg==',
		'base64',
	);

	// @ts-expect-error: node.js buffer it no likey
	const result = Array.from(iterateAtpRepo(buf), (entry) => ({
		collection: entry.collection,
		rkey: entry.rkey,
		record: entry.record,
	}));

	expect(result).toEqual([
		{
			collection: 'app.bsky.actor.profile',
			rkey: 'self',
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
