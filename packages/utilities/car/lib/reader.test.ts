import { expect, it } from 'bun:test';

import { fromString, toCidLink } from '@atcute/cid';
import { fromBase64 } from '@atcute/multibase';

import { readCar } from './reader.js';

it('reads car files', () => {
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

	const { header, iterate } = readCar(buf);
	const blocks = Array.from(iterate());

	expect(header).toEqual({
		data: {
			version: 1,
			roots: [toCidLink(fromString('bafyreieqh4enamx6dlbhoofeiss76zhppsdyf24scggmjclty246ucmdye'))],
		},
		dataEnd: 59,
		dataStart: 1,
		headerEnd: 59,
		headerStart: 0,
	});

	expect(blocks).toEqual([
		{
			cid: fromString('bafyreihkdpfd6d36zlpbsxmfatgenl37kl6j73l7l27h6xqh2zoyffrk5i'),
			bytes: fromBase64(
				'pGUkdHlwZXZhcHAuYnNreS5hY3Rvci5wcm9maWxlaWNyZWF0ZWRBdHgYMjAyNC0wMi0yNFQxMjoxNTo0MS4yMTlaa2Rlc2NyaXB0aW9ub3Rlc3RpbmcgYWNjb3VudGtkaXNwbGF5TmFtZWA',
			),
			entryEnd: 204,
			entryStart: 59,
			cidEnd: 97,
			cidStart: 61,
			bytesEnd: 204,
			bytesStart: 97,
		},
		{
			cid: fromString('bafyreieqh4enamx6dlbhoofeiss76zhppsdyf24scggmjclty246ucmdye'),
			bytes: fromBase64(
				'pmNkaWR4IGRpZDpwbGM6c3JjcW91Mm03dXF1b2d5ZDV4azRiNXk1Y3Jldm0zbDVxNWZqZW50YzJkY3NpZ1hA3llhDuf71ekpp21Ky0bvVoVqiJBygDRhTop98ahXOH4LbmM5GxVxSQzEFNOpwVsYnLfBUPCmrPTK9nwwIfvr1WRkYXRh2CpYJQABcRIgdom5KY96+HHU2oPb9oqSHvH8co1BToAo2W7WJ34cidhkcHJldvZndmVyc2lvbgM',
			),
			entryEnd: 430,
			entryStart: 204,
			cidEnd: 242,
			cidStart: 206,
			bytesEnd: 430,
			bytesStart: 242,
		},
		{
			cid: fromString('bafyreidwrg4std327by5jwud3p3iveq66h6hfdkbj2acrwlo2ytx4hej3a'),
			bytes: fromBase64(
				'omFlgaRha1gbYXBwLmJza3kuYWN0b3IucHJvZmlsZS9zZWxmYXAAYXTYKlglAAFxEiBvSJJSaF/w/fee+UmoLV84FDwZRC7ppJX484MghY0rM2F22CpYJQABcRIg6hvKPw9+yt4ZXYUEzEavf1L8n+1/Xr5/XgfWXYKWKuphbPY',
			),
			entryEnd: 596,
			entryStart: 430,
			cidEnd: 468,
			cidStart: 432,
			bytesEnd: 596,
			bytesStart: 468,
		},
		{
			cid: fromString('bafyreidpjcjfe2c76d67phxzjguc2xzycq6bsrbo5gsjl6htqmqildjlgm'),
			bytes: fromBase64(
				'omFlgaRha1ggYXBwLmJza3kuZmVlZC5wb3N0LzNrbTV5bWs0aGhrMnphcABhdPZhdtgqWCUAAXESIOP6BT3TcvcXcCtYKD5p5BlgSIzeigjGodtW9tA9m8RsYWz2',
			),
			entryEnd: 727,
			entryStart: 596,
			cidEnd: 634,
			cidStart: 598,
			bytesEnd: 727,
			bytesStart: 634,
		},
		{
			cid: fromString('bafyreihd7ict3u3s64lxak2yfa7gtzazmbeizxukbddkdw2w63id3g6enq'),
			bytes: fromBase64(
				'pWR0ZXh0dWJlZXAgYm9vcCBAbWFyeS5teS5pZGUkdHlwZXJhcHAuYnNreS5mZWVkLnBvc3RlbGFuZ3OBYmVuZmZhY2V0c4GjZSR0eXBld2FwcC5ic2t5LnJpY2h0ZXh0LmZhY2V0ZWluZGV4omdieXRlRW5kFWlieXRlU3RhcnQKaGZlYXR1cmVzgaJjZGlkeCBkaWQ6cGxjOmlhNzZrdm5uZGp1dGdlZGdneDJpYnJlbWUkdHlwZXgfYXBwLmJza3kucmljaHRleHQuZmFjZXQjbWVudGlvbmljcmVhdGVkQXR4GDIwMjQtMDItMjRUMTI6MTY6MjAuNjM3Wg',
			),
			entryEnd: 1018,
			entryStart: 727,
			cidEnd: 765,
			cidStart: 729,
			bytesEnd: 1018,
			bytesStart: 765,
		},
	]);
});
