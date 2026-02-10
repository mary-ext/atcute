import * as ipld from '@ipld/dag-cbor';
import * as cborx from 'cbor-x/index-no-eval'; // doesn't do new Function nor native acceleration
import { bench, do_not_optimize, run, summary } from 'mitata';

import * as atcute from './index.ts';

const getObject = () => ({
	text: '今週もメンバー限定放送ご視聴感謝！！\n本日の添削内容としては\n\n◆そくめんさん\n・衣装デザインをキャラ性に合わせて修正\n・背景修正\n・エフェクト調整\n\n全体的にキャラクターの役割とコンセプトに合わせて諸々のデザインを調整したという感じでした！\n\n#珈琲紳士の部屋',
	$type: 'app.bsky.feed.post',
	embed: {
		$type: 'app.bsky.embed.recordWithMedia',
		media: {
			$type: 'app.bsky.embed.images',
			images: [
				{
					alt: '',
					image: {
						$type: 'blob',
						ref: {
							$link: 'bafkreid6kzv5nscpk34asjm2w7a36zwhao67g7tkvnyv3v4jgyyw3c3pde',
						},
						mimeType: 'image/jpeg',
						size: 955936,
					},
					aspectRatio: {
						width: 2000,
						height: 1776,
					},
				},
			],
		},
		record: {
			$type: 'app.bsky.embed.record',
			record: {
				cid: 'bafyreico42svous36k4edzyb7cbqopohqsw6qt3scycmq32hsaecvh4qoa',
				uri: 'at://did:plc:gntwx32hbw2c7zxbtuivi66r/app.bsky.feed.post/3meaf546ub22t',
			},
		},
	},
	langs: ['ja'],
	facets: [
		{
			index: {
				byteEnd: 371,
				byteStart: 349,
			},
			features: [
				{
					tag: '珈琲紳士の部屋',
					$type: 'app.bsky.richtext.facet#tag',
				},
			],
		},
	],
	createdAt: '2026-02-07T14:14:25.882Z',
});

const getBuffer = () => atcute.encode(getObject());

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
