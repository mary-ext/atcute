import * as ipld from '@ipld/dag-cbor';
import * as cborx from 'cbor-x/index-no-eval';
import { bench, do_not_optimize, run, summary } from 'mitata';

import ozoneDefs from '../../../definitions/ozone/lexicons/tools/ozone/moderation/defs.json' with { type: 'json' };

import * as atcute from './index.ts';

interface Lcg {
	s: number;
}

const VALID_CID = 'bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee';

const rand = (lcg: Lcg): number => {
	lcg.s = (1664525 * lcg.s + 1013904223) >>> 0;
	return lcg.s;
};

const randInt = (lcg: Lcg, max: number): number => {
	return rand(lcg) % max;
};

const pick = <T>(lcg: Lcg, values: readonly T[]): T => {
	return values[randInt(lcg, values.length)]!;
};

const WORDS = [
	'atproto',
	'bluesky',
	'firehose',
	'post',
	'record',
	'stream',
	'facet',
	'link',
	'ops',
	'seq',
	'commit',
	'repo',
	'mst',
	'car',
	'block',
	'json',
	'cbor',
	'event',
	'codec',
	'lexicon',
] as const;

const TLDS = ['bsky.social', 'example.com', 'test.dev'] as const;

const toBase32 = (num: number, len: number): string => {
	let out = '';
	let n = num >>> 0;
	const alpha = 'abcdefghijklmnopqrstuvwxyz234567';

	for (let i = 0; i < len; i++) {
		out += alpha[n & 31];
		n = (n * 1103515245 + 12345) >>> 0;
	}

	return out;
};

const makeDid = (n: number): string => {
	return `did:plc:${toBase32(n, 24)}`;
};

const makeAtUri = (did: string, collection: string, seed: number): string => {
	return `at://${did}/${collection}/${toBase32(seed, 13)}`;
};

const makeText = (lcg: Lcg, minWords: number, maxWords: number): string => {
	const count = minWords + randInt(lcg, maxWords - minWords + 1);
	let text = '';

	for (let i = 0; i < count; i++) {
		if (i !== 0) {
			text += ' ';
		}
		text += pick(lcg, WORDS);
	}

	return text;
};

const makeFirehoseFixtures = (count: number): unknown[] => {
	const lcg: Lcg = { s: 0xdecafbad };
	const fixtures: unknown[] = [];

	for (let i = 0; i < count; i++) {
		const did = makeDid(rand(lcg));
		const actor = `${toBase32(rand(lcg), 10)}.${pick(lcg, TLDS)}`;
		const createdAt = `2025-0${(i % 9) + 1}-1${i % 9}T1${i % 10}:2${i % 6}:3${i % 10}.000Z`;

		switch (i % 5) {
			case 0: {
				fixtures.push({
					$type: 'app.bsky.feed.post',
					text: makeText(lcg, 20, 60),
					createdAt,
					langs: [pick(lcg, ['en', 'ja', 'pt', 'de'] as const)],
					facets:
						randInt(lcg, 4) === 0
							? [
									{
										features: [
											{
												$type: 'app.bsky.richtext.facet#link',
												uri: `https://${actor}/${toBase32(rand(lcg), 8)}`,
											},
										],
										index: {
											byteStart: 0,
											byteEnd: 20,
										},
									},
								]
							: undefined,
				});
				break;
			}
			case 1: {
				fixtures.push({
					$type: 'app.bsky.feed.like',
					subject: {
						uri: makeAtUri(makeDid(rand(lcg)), 'app.bsky.feed.post', rand(lcg)),
						cid: { $link: VALID_CID },
					},
					createdAt,
				});
				break;
			}
			case 2: {
				fixtures.push({
					$type: 'app.bsky.feed.repost',
					subject: {
						uri: makeAtUri(makeDid(rand(lcg)), 'app.bsky.feed.post', rand(lcg)),
						cid: { $link: VALID_CID },
					},
					createdAt,
				});
				break;
			}
			case 3: {
				fixtures.push({
					$type: 'app.bsky.graph.follow',
					subject: makeDid(rand(lcg)),
					createdAt,
				});
				break;
			}
			default: {
				fixtures.push({
					$type: 'com.atproto.repo.putRecord',
					repo: did,
					collection: pick(lcg, [
						'app.bsky.feed.post',
						'app.bsky.feed.like',
						'app.bsky.feed.repost',
						'app.bsky.graph.follow',
					] as const),
					rkey: toBase32(rand(lcg), 13),
					record: {
						$type: 'app.bsky.actor.profile',
						displayName: `${toBase32(rand(lcg), 8)} ${toBase32(rand(lcg), 8)}`,
						description: makeText(lcg, 20, 40),
						avatar: {
							ref: { $link: VALID_CID },
							mimeType: 'image/jpeg',
							size: 12345,
						},
					},
					swapRecord: randInt(lcg, 2) ? { $link: VALID_CID } : undefined,
				});
				break;
			}
		}
	}

	const lexiconCount = Math.max(1, count >> 6);
	for (let i = 0; i < lexiconCount; i++) {
		fixtures.push(structuredClone(ozoneDefs));
	}

	return fixtures;
};

const stripUndefined = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		const out = new Array(value.length);
		for (let i = 0; i < value.length; i++) {
			out[i] = stripUndefined(value[i]);
		}
		return out;
	}

	if (value && typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		const out: Record<string, unknown> = {};
		const keys = Object.keys(obj);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i]!;
			const prop = obj[key];
			if (prop !== undefined) {
				out[key] = stripUndefined(prop);
			}
		}

		return out;
	}

	return value;
};

const FIXTURES = makeFirehoseFixtures(2000);
const IPLD_FIXTURES = FIXTURES.map((value) => stripUndefined(value));
const ATCUTE_BUFFERS = FIXTURES.map((value) => atcute.encode(value));

summary(() => {
	bench('cbor-x encode (firehose mix)', function* () {
		yield {
			[0]() {
				return FIXTURES;
			},
			bench(records: unknown[]) {
				const encoder = new cborx.Encoder({ useRecords: false });
				let total = 0;

				for (let i = 0; i < records.length; i++) {
					total += encoder.encode(records[i]!).byteLength;
				}

				return do_not_optimize(total);
			},
		};
	});

	bench('@ipld/dag-cbor encode (firehose mix)', function* () {
		yield {
			[0]() {
				return IPLD_FIXTURES;
			},
			bench(records: unknown[]) {
				let total = 0;

				for (let i = 0; i < records.length; i++) {
					total += ipld.encode(records[i]!).byteLength;
				}

				return do_not_optimize(total);
			},
		};
	});

	bench('@atcute/cbor encode (firehose mix)', function* () {
		yield {
			[0]() {
				return FIXTURES;
			},
			bench(records: unknown[]) {
				let total = 0;

				for (let i = 0; i < records.length; i++) {
					total += atcute.encode(records[i]!).byteLength;
				}

				return do_not_optimize(total);
			},
		};
	});
});

summary(() => {
	bench('cbor-x decode (firehose mix)', function* () {
		yield {
			[0]() {
				return ATCUTE_BUFFERS;
			},
			bench(buffers: Uint8Array[]) {
				const decoder = new cborx.Decoder({ useRecords: false });
				let total = 0;

				for (let i = 0; i < buffers.length; i++) {
					const value = decoder.decode(buffers[i]!);
					total += typeof value === 'object' && value ? 1 : 0;
				}

				return do_not_optimize(total);
			},
		};
	});

	bench('@ipld/dag-cbor decode (firehose mix)', function* () {
		yield {
			[0]() {
				return ATCUTE_BUFFERS;
			},
			bench(buffers: Uint8Array[]) {
				let total = 0;

				for (let i = 0; i < buffers.length; i++) {
					const value = ipld.decode(buffers[i]!);
					total += typeof value === 'object' && value ? 1 : 0;
				}

				return do_not_optimize(total);
			},
		};
	});

	bench('@atcute/cbor decode (firehose mix)', function* () {
		yield {
			[0]() {
				return ATCUTE_BUFFERS;
			},
			bench(buffers: Uint8Array[]) {
				let total = 0;

				for (let i = 0; i < buffers.length; i++) {
					const value = atcute.decode(buffers[i]!);
					total += typeof value === 'object' && value ? 1 : 0;
				}

				return do_not_optimize(total);
			},
		};
	});
});

await run();
