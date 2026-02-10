import * as ipld from '@ipld/dag-cbor';
import * as cborx from 'cbor-x/index-no-eval'; // doesn't do new Function nor native acceleration
import { bench, do_not_optimize, run, summary } from 'mitata';

import * as atcute from './index.ts';

const getObject = () => ({
	text: "I've just published a new userscript that remembers the path of your cursor over the linked pages of Wikipedia, averaging and wearing them into the page, showing your browsing history over time\n\nInstall at greasyfork.org/en/scripts/5... or read more about it everest-pipkin.com#projects/des...",
	$type: 'app.bsky.feed.post',
	embed: {
		$type: 'app.bsky.embed.external',
		external: {
			uri: 'https://greasyfork.org/en/scripts/565058-desire-paths-for-wikipedia',
			thumb: {
				$type: 'blob',
				ref: {
					$link: 'bafkreibqqp6ycgnfwlzyifozfycmlfofu47lbunt72otu5hsqgz7bfm2uu',
				},
				mimeType: 'image/jpeg',
				size: 696797,
			},
			title: 'Desire Paths for Wikipedia',
			description:
				'An extension that remembers the path of a cursor over the linked pages of Wikipedia, “wearing” them into the page.',
		},
	},
	langs: ['en'],
	facets: [
		{
			index: {
				byteEnd: 236,
				byteStart: 206,
			},
			features: [
				{
					uri: 'https://greasyfork.org/en/scripts/565058-desire-paths-for-wikipedia',
					$type: 'app.bsky.richtext.facet#link',
				},
			],
		},
		{
			index: {
				byteEnd: 293,
				byteStart: 259,
			},
			features: [
				{
					uri: 'https://everest-pipkin.com/#projects/desirepaths.html',
					$type: 'app.bsky.richtext.facet#link',
				},
			],
		},
	],
	createdAt: '2026-02-07T19:59:28.214Z',
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
