import * as ipld from '@ipld/dag-cbor';
import * as cborx from 'cbor-x/index-no-eval'; // doesn't do new Function nor native acceleration
import { bench, do_not_optimize, run, summary } from 'mitata';

import * as atcute from './index.ts';

const getBuffer = () =>
	new Uint8Array([
		163, 100, 116, 101, 120, 116, 121, 1, 110, 227, 130, 185, 227, 131, 158, 227, 131, 188, 227, 131, 136,
		227, 131, 149, 227, 130, 169, 227, 131, 179, 227, 130, 162, 227, 131, 151, 227, 131, 170, 227, 128, 140,
		78, 105, 110, 116, 101, 110, 100, 111, 32, 83, 119, 105, 116, 99, 104, 32, 65, 112, 112, 227, 128, 141,
		227, 129, 139, 227, 130, 137, 231, 132, 161, 230, 150, 153, 227, 129, 167, 229, 136, 169, 231, 148, 168,
		227, 129, 167, 227, 129, 141, 227, 130, 139, 227, 128, 129, 230, 150, 176, 227, 129, 159, 227, 129, 170,
		227, 130, 178, 227, 131, 188, 227, 131, 160, 233, 128, 163, 230, 144, 186, 227, 130, 179, 227, 131, 179,
		227, 131, 134, 227, 131, 179, 227, 131, 132, 227, 128, 140, 90, 69, 76, 68, 65, 32, 78, 79, 84, 69, 83,
		227, 128, 141, 227, 129, 140, 231, 153, 187, 229, 160, 180, 227, 128, 130, 10, 227, 130, 188, 227, 131,
		171, 227, 131, 128, 50, 227, 130, 191, 227, 130, 164, 227, 131, 136, 227, 131, 171, 227, 129, 174, 78,
		105, 110, 116, 101, 110, 100, 111, 32, 83, 119, 105, 116, 99, 104, 32, 50, 32, 69, 100, 105, 116, 105,
		111, 110, 227, 129, 168, 230, 142, 165, 231, 182, 154, 227, 129, 153, 227, 130, 139, 227, 129, 147, 227,
		129, 168, 227, 129, 167, 227, 128, 129, 232, 168, 170, 227, 130, 140, 227, 129, 159, 227, 129, 147, 227,
		129, 168, 227, 129, 174, 227, 129, 170, 227, 129, 132, 229, 160, 180, 230, 137, 128, 227, 129, 184, 227,
		129, 174, 233, 159, 179, 229, 163, 176, 227, 131, 138, 227, 131, 147, 227, 129, 170, 227, 129, 169, 227,
		128, 129, 227, 129, 149, 227, 129, 190, 227, 129, 150, 227, 129, 190, 227, 129, 170, 230, 169, 159, 232,
		131, 189, 227, 129, 167, 227, 131, 143, 227, 130, 164, 227, 131, 169, 227, 131, 171, 227, 129, 174, 229,
		134, 146, 233, 153, 186, 227, 129, 140, 227, 130, 136, 227, 130, 138, 230, 183, 177, 227, 129, 143, 230,
		165, 189, 227, 129, 151, 227, 130, 129, 227, 130, 139, 227, 128, 130, 101, 36, 116, 121, 112, 101, 114,
		97, 112, 112, 46, 98, 115, 107, 121, 46, 102, 101, 101, 100, 46, 112, 111, 115, 116, 105, 99, 114, 101,
		97, 116, 101, 100, 65, 116, 120, 24, 50, 48, 50, 53, 45, 48, 52, 45, 48, 50, 84, 49, 51, 58, 50, 55, 58,
		50, 57, 46, 48, 48, 48, 90,
	]);

const getObject = () => ({
	text: 'スマートフォンアプリ「Nintendo Switch App」から無料で利用できる、新たなゲーム連携コンテンツ「ZELDA NOTES」が登場。\nゼルダ2タイトルのNintendo Switch 2 Editionと接続することで、訪れたことのない場所への音声ナビなど、さまざまな機能でハイラルの冒険がより深く楽しめる。',
	$type: 'app.bsky.feed.post',
	createdAt: '2025-04-02T13:27:29.000Z',
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

	if (!process.argv.includes('--no-json-ref')) {
		bench('ref: JSON.stringify', function* () {
			yield {
				[0]() {
					return getObject();
				},
				bench(record: object) {
					return do_not_optimize(JSON.stringify(record));
				},
			};
		});
	}
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

	if (!process.argv.includes('--no-json-ref')) {
		bench('ref: JSON.parse', function* () {
			yield {
				[0]() {
					return JSON.stringify(getObject());
				},
				bench(json: string) {
					return do_not_optimize(JSON.parse(json));
				},
			};
		});
	}
});

await run();
