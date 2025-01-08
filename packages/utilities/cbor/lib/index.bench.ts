import { bench, do_not_optimize, run, summary } from 'mitata';

import * as ipld from '@ipld/dag-cbor';
import * as cborx from 'cbor-x/index-no-eval'; // doesn't do new Function nor native acceleration
import * as atcute from './index.js';

const getBuffer = () =>
	new Uint8Array([
		165, 100, 116, 101, 120, 116, 120, 235, 105, 110, 116, 114, 111, 100, 117, 99, 105, 110, 103, 32, 97, 116,
		99, 117, 116, 101, 44, 32, 97, 32, 99, 111, 108, 108, 101, 99, 116, 105, 111, 110, 32, 111, 102, 32, 108,
		105, 103, 104, 116, 119, 101, 105, 103, 104, 116, 32, 84, 121, 112, 101, 83, 99, 114, 105, 112, 116, 32,
		112, 97, 99, 107, 97, 103, 101, 115, 32, 102, 111, 114, 32, 65, 84, 32, 80, 114, 111, 116, 111, 99, 111,
		108, 10, 10, 65, 80, 73, 32, 99, 108, 105, 101, 110, 116, 44, 32, 79, 65, 117, 116, 104, 32, 99, 108, 105,
		101, 110, 116, 44, 32, 117, 116, 105, 108, 105, 116, 121, 32, 112, 97, 99, 107, 97, 103, 101, 115, 32,
		102, 111, 114, 32, 118, 97, 114, 105, 111, 117, 115, 32, 100, 97, 116, 97, 32, 102, 111, 114, 109, 97,
		116, 115, 44, 32, 66, 108, 117, 101, 115, 107, 121, 45, 115, 112, 101, 99, 105, 102, 105, 99, 32, 117,
		116, 105, 108, 105, 116, 121, 32, 112, 97, 99, 107, 97, 103, 101, 115, 32, 102, 111, 114, 32, 114, 105,
		99, 104, 32, 116, 101, 120, 116, 32, 97, 110, 100, 32, 112, 111, 115, 116, 105, 110, 103, 10, 10, 116,
		104, 101, 121, 39, 114, 101, 32, 97, 108, 108, 32, 99, 111, 118, 101, 114, 101, 100, 33, 101, 36, 116,
		121, 112, 101, 114, 97, 112, 112, 46, 98, 115, 107, 121, 46, 102, 101, 101, 100, 46, 112, 111, 115, 116,
		101, 108, 97, 110, 103, 115, 129, 98, 101, 110, 102, 102, 97, 99, 101, 116, 115, 129, 162, 101, 105, 110,
		100, 101, 120, 162, 103, 98, 121, 116, 101, 69, 110, 100, 18, 105, 98, 121, 116, 101, 83, 116, 97, 114,
		116, 12, 104, 102, 101, 97, 116, 117, 114, 101, 115, 129, 162, 99, 117, 114, 105, 120, 34, 104, 116, 116,
		112, 115, 58, 47, 47, 103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47, 109, 97, 114, 121, 45, 101, 120,
		116, 47, 97, 116, 99, 117, 116, 101, 101, 36, 116, 121, 112, 101, 120, 28, 97, 112, 112, 46, 98, 115, 107,
		121, 46, 114, 105, 99, 104, 116, 101, 120, 116, 46, 102, 97, 99, 101, 116, 35, 108, 105, 110, 107, 105,
		99, 114, 101, 97, 116, 101, 100, 65, 116, 120, 24, 50, 48, 50, 52, 45, 49, 48, 45, 49, 57, 84, 49, 52, 58,
		49, 51, 58, 53, 57, 46, 51, 53, 53, 90,
	]);

const getObject = () => ({
	$type: 'app.bsky.feed.post',
	createdAt: '2024-10-19T14:13:59.355Z',
	facets: [
		{
			features: [
				{
					$type: 'app.bsky.richtext.facet#link',
					uri: 'https://github.com/mary-ext/atcute',
				},
			],
			index: {
				byteEnd: 18,
				byteStart: 12,
			},
		},
	],
	langs: ['en'],
	text: "introducing atcute, a collection of lightweight TypeScript packages for AT Protocol\n\nAPI client, OAuth client, utility packages for various data formats, Bluesky-specific utility packages for rich text and posting\n\nthey're all covered!",
});

summary(() => {
	bench('cbor-x encode', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(record: object) {
				const encode = new cborx.Encoder({ useRecords: false });
				return do_not_optimize(encode.encode(record));
			},
		};
	});

	bench('@ipld/dag-cbor encode', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(record: object) {
				return do_not_optimize(ipld.encode(record));
			},
		};
	});

	bench('@atcute/cbor encode', function* () {
		yield {
			[0]() {
				return getObject();
			},
			bench(record: object) {
				return do_not_optimize(atcute.encode(record));
			},
		};
	});

	// bench('ref: JSON.stringify', function* () {
	// 	yield {
	// 		[0]() {
	// 			return getObject();
	// 		},
	// 		bench(record: object) {
	// 			return do_not_optimize(JSON.stringify(record));
	// 		},
	// 	};
	// });
});

summary(() => {
	bench('cbor-x decode', function* () {
		yield {
			[0]() {
				return getBuffer();
			},
			bench(buffer: Uint8Array) {
				const decode = new cborx.Decoder({ useRecords: false });
				return do_not_optimize(decode.decode(buffer));
			},
		};
	});

	bench('@ipld/dag-cbor decode', function* () {
		yield {
			[0]() {
				return getBuffer();
			},
			bench(buffer: Uint8Array) {
				return do_not_optimize(ipld.decode(buffer));
			},
		};
	});

	bench('@atcute/cbor decode', function* () {
		yield {
			[0]() {
				return getBuffer();
			},
			bench(buffer: Uint8Array) {
				return do_not_optimize(atcute.decode(buffer));
			},
		};
	});

	// bench('ref: JSON.parse', function* () {
	// 	yield {
	// 		[0]() {
	// 			return JSON.stringify(getObject());
	// 		},
	// 		bench(json: string) {
	// 			return do_not_optimize(JSON.parse(json));
	// 		},
	// 	};
	// });
});

await run();
