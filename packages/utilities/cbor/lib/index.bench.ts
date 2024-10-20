import { bench, run, summary } from 'mitata';

import * as ipld from '@ipld/dag-cbor';
import * as atcute from './index.js';

summary(() => {
	bench('@ipld/dag-cbor encode', () => {
		const record = {
			$type: 'app.bsky.feed.post',
			createdAt: '2024-08-18T03:18:24.000Z',
			langs: ['en'],
			text: 'hello world!',
		};

		ipld.encode(record);
	});

	bench('@atcute/cbor encode', () => {
		const record = {
			$type: 'app.bsky.feed.post',
			createdAt: '2024-08-18T03:18:24.000Z',
			langs: ['en'],
			text: 'hello world!',
		};

		atcute.encode(record);
	});
});

summary(() => {
	bench('@ipld/dag-cbor decode', () => {
		const u8 = new Uint8Array([
			164, 100, 116, 101, 120, 116, 108, 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33, 101, 36,
			116, 121, 112, 101, 114, 97, 112, 112, 46, 98, 115, 107, 121, 46, 102, 101, 101, 100, 46, 112, 111, 115,
			116, 101, 108, 97, 110, 103, 115, 129, 98, 101, 110, 105, 99, 114, 101, 97, 116, 101, 100, 65, 116, 120,
			24, 50, 48, 50, 52, 45, 48, 56, 45, 49, 56, 84, 48, 51, 58, 49, 56, 58, 50, 52, 46, 48, 48, 48, 90,
		]);

		ipld.decode(u8);
	});

	bench('@atcute/cbor decode', () => {
		const u8 = new Uint8Array([
			164, 100, 116, 101, 120, 116, 108, 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33, 101, 36,
			116, 121, 112, 101, 114, 97, 112, 112, 46, 98, 115, 107, 121, 46, 102, 101, 101, 100, 46, 112, 111, 115,
			116, 101, 108, 97, 110, 103, 115, 129, 98, 101, 110, 105, 99, 114, 101, 97, 116, 101, 100, 65, 116, 120,
			24, 50, 48, 50, 52, 45, 48, 56, 45, 49, 56, 84, 48, 51, 58, 49, 56, 58, 50, 52, 46, 48, 48, 48, 90,
		]);

		atcute.decode(u8);
	});
});

await run();
