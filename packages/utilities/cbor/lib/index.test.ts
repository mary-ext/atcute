import { expect, it, describe } from 'bun:test';

import * as CID from '@atcute/cid';
import { fromBase64, toBase16 } from '@atcute/multibase';

import { decode, decodeFirst, encode, toBytes, toCidLink } from './index.js';
import { getOrderedObjectKeys } from './encode.js';

const utf8e = new TextEncoder();
// const utf8d = new TextDecoder();

const referenceKeySorter = (obj: Record<string, unknown>): string[] => {
	return Object.keys(obj)
		.filter((key) => obj[key] !== undefined)
		.sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
};

describe('key sorting', () => {
	it('sorts key appropriately', () => {
		const object = {
			key: 'value',
			link: toCidLink(CID.fromString('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee')),
			bytes: toBytes(utf8e.encode('lorem ipsum sit dolor amet')),
			answer: 42,
			correct: true,
			wrong: false,
			empty: undefined,
			blank: null,
			minInteger: Number.MIN_SAFE_INTEGER,
			maxInteger: Number.MAX_SAFE_INTEGER,
			float: 3.14,
			nested: {
				hello: 'world',
			},
			bee: [
				`According to all known laws of aviation, there is no way that a bee should be able to fly.`,
				`Its wings are too small to get its fat little body off the ground.`,
				`The bee, of course, flies anyway.`,
				`Because bees don't care what humans think is impossible.`,

				`Ladies and gentlemen of the jury, my grandmother was a simple woman.`,
				`Born on a farm, she believed it was man's divine right to benefit from the county of nature God put before us.`,
				`If we were to live the topsy-turvy world Mr. Benson imagines, just think of what if would mean?`,
				`Maybe I would have to negotiate with the silkworm for the elastic in my britches!`,
				`Talking bee!`,
				`How do we know this isn't some sort of holographic motion-picture-capture hollywood wizardry?`,
				`They could be using laser beams! Robotics! Ventriloquism! Cloning! For all we know he could be on steroids!`,

				`Ladies and gentlemen of the jury, there's no trickery here. I'm just an ordinary bee.`,
				`And as a bee, honey's pretty important to me. It's important to all bees.`,
				`We invented it, we make it, and we protect it with our lives.`,
				`Unfortunately, there are some people in this room who think they can take whatever they want from us, 'cause we're the little guys!`,
				`And what I'm hoping is that after this is all over, you'll see how by taking our honey, you're not only taking away everything we have, but everything we are!`,
			],
		};

		const expected = referenceKeySorter(object);
		const actual = getOrderedObjectKeys(object);
		expect(actual).toEqual(expected);
	});
});

it('encodes primitives', () => {
	expect(toBase16(encode('hello world!'))).toMatchInlineSnapshot(`"6c68656c6c6f20776f726c6421"`);
	expect(toBase16(encode('おはようございます☀️'))).toMatchInlineSnapshot(
		`"7821e3818ae381afe38288e38186e38194e38196e38184e381bee38199e29880efb88f"`,
	);

	expect(toBase16(encode(42))).toMatchInlineSnapshot(`"182a"`);
	expect(toBase16(encode(3.14))).toMatchInlineSnapshot(`"fb40091eb851eb851f"`);
	expect(toBase16(encode(Number.MAX_SAFE_INTEGER))).toMatchInlineSnapshot(`"1b001fffffffffffff"`);
	expect(toBase16(encode(Number.MIN_SAFE_INTEGER))).toMatchInlineSnapshot(`"3b001ffffffffffffe"`);

	expect(toBase16(encode(true))).toMatchInlineSnapshot(`"f5"`);
	expect(toBase16(encode(false))).toMatchInlineSnapshot(`"f4"`);
	expect(toBase16(encode(null))).toMatchInlineSnapshot(`"f6"`);
});

it('encodes and decodes into the same value', () => {
	const object = {
		key: 'value',
		link: toCidLink(CID.fromString('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee')),
		bytes: toBytes(utf8e.encode('lorem ipsum sit dolor amet')),
		answer: 42,
		correct: true,
		wrong: false,
		empty: undefined,
		blank: null,
		b16: 262,
		b32: 65542,
		minInteger: Number.MIN_SAFE_INTEGER,
		maxInteger: Number.MAX_SAFE_INTEGER,
		pi: 3.141592653589793,
		npi: -3.141592653589793,
		nested: {
			hello: 'world',
		},
		bee: [
			`According to all known laws of aviation, there is no way that a bee should be able to fly.`,
			`Its wings are too small to get its fat little body off the ground.`,
			`The bee, of course, flies anyway.`,
			`Because bees don't care what humans think is impossible.`,

			`Ladies and gentlemen of the jury, my grandmother was a simple woman.`,
			`Born on a farm, she believed it was man's divine right to benefit from the county of nature God put before us.`,
			`If we were to live the topsy-turvy world Mr. Benson imagines, just think of what if would mean?`,
			`Maybe I would have to negotiate with the silkworm for the elastic in my britches!`,
			`Talking bee!`,
			`How do we know this isn't some sort of holographic motion-picture-capture hollywood wizardry?`,
			`They could be using laser beams! Robotics! Ventriloquism! Cloning! For all we know he could be on steroids!`,

			`Ladies and gentlemen of the jury, there's no trickery here. I'm just an ordinary bee.`,
			`And as a bee, honey's pretty important to me. It's important to all bees.`,
			`We invented it, we make it, and we protect it with our lives.`,
			`Unfortunately, there are some people in this room who think they can take whatever they want from us, 'cause we're the little guys!`,
			`And what I'm hoping is that after this is all over, you'll see how by taking our honey, you're not only taking away everything we have, but everything we are!`,
		],
	};

	const encoded = encode(object);
	const decoded = decode(encoded);

	expect(decoded).toEqual(object);
	expect(decoded.link.$link).toEqual('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee');
	expect('empty' in decoded).toBe(false);
});

it('encodes atproto post records', async () => {
	{
		const record = {
			$type: 'app.bsky.feed.post',
			createdAt: '2024-08-13T01:16:06.453Z',
			embed: {
				$type: 'app.bsky.embed.images',
				images: [
					{
						alt: 'a photoshopped picture of kit with a microphone. kit is saying "meow"',
						aspectRatio: { height: 885, width: 665 },
						image: {
							$type: 'blob',
							ref: { $link: 'bafkreic6hvmy3ymbo25wxsvylu77r57uwhtnviu7vmhfsns3ab4xfal5ou' },
							mimeType: 'image/jpeg',
							size: 645553,
						},
					},
				],
			},
			langs: ['en'],
			text: 'exclusively on bluesky',
		};

		const encoded = encode(record);

		expect(CID.toString(await CID.create(0x71, encoded))).toBe(
			'bafyreicbb3p4hmtm7iw3k7kiydzqp7qhufq3jdc5sbc4gxa4mxqd6bywba',
		);
	}

	{
		const record = {
			$type: 'app.bsky.feed.post',
			createdAt: '2025-01-02T23:29:41.149Z',
			embed: {
				$type: 'app.bsky.embed.images',
				images: [
					{
						alt: '',
						aspectRatio: { height: 2000, width: 1500 },
						image: {
							$type: 'blob',
							ref: { $link: 'bafkreibdqy5qcefkcuvopnkt2tip5wzouscmp6duz377cneknktnsgfewe' },
							mimeType: 'image/jpeg',
							size: 531257,
						},
					},
				],
			},
			facets: [
				{
					features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '写真' }],
					index: { byteEnd: 109, byteStart: 100 },
				},
				{
					features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '日の出' }],
					index: { byteEnd: 122, byteStart: 110 },
				},
				{
					features: [{ $type: 'app.bsky.richtext.facet#tag', tag: '日常' }],
					index: { byteEnd: 132, byteStart: 123 },
				},
				{
					features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'キリトリセカイ' }],
					index: { byteEnd: 157, byteStart: 133 },
				},
			],
			langs: ['ja'],
			text: 'おはようございます☀️\n今日の日の出です\n寒かったけど綺麗でしたよ✨\n\n＃写真\n＃日の出\n＃日常\n＃キリトリセカイ',
		};

		const encoded = encode(record);

		expect(CID.toString(await CID.create(0x71, encoded))).toBe(
			'bafyreiarjuvb3oppjnouaiasitt2tekkhhge6qsd4xegutblzgmihmnrhi',
		);
	}
});

it('decodes awfully-nested objects', () => {
	// thanks @retr0id for this cursed atproto record
	// at://did:plc:vwzwgnygau7ed7b7wt5ux7y2/app.bsky.feed.post/3jupzkqugm225
	const bytes = fromBase64(
		`pGR0ZXh0ZHRlc3RlJHR5cGVyYXBwLmJza3kuZmVlZC5wb3N0ZW1hZ2ljgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGB` +
			`gYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg` +
			`YGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgY` +
			`GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG` +
			`BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYBpY3JlYXRlZEF0eBsyMDIz` +
			`LTA1LTAyVDA2OjE2OjE2Ljg3Njg4OVo`,
	);

	expect(() => decode(bytes)).not.toThrow();
});

it('decodes buffer containing two cbor objects', () => {
	let buffer: Uint8Array;

	{
		const a = encode({ foo: true });
		const b = encode({ bar: false });

		buffer = new Uint8Array(a.byteLength + b.byteLength);
		buffer.set(a, 0);
		buffer.set(b, a.byteLength);
	}

	const values = decodeCborMultiple(buffer, 2);
	expect(values).toEqual([{ foo: true }, { bar: false }]);
});

it('throws on unexpected number values', () => {
	expect(() => encode(Infinity)).toThrow();
	expect(() => encode(-Infinity)).toThrow();
	expect(() => encode(NaN)).toThrow();
	expect(() => encode(Number.MAX_SAFE_INTEGER + 1)).toThrow();
	expect(() => encode(Number.MIN_SAFE_INTEGER - 1)).toThrow();
});

it('throws on undefined values', () => {
	expect(() => encode(undefined)).toThrow();
});

it('throws on unexpected cid-link and bytes values', () => {
	expect(() => encode({ $link: 123 })).toThrow();
	expect(() => encode({ $bytes: 123 })).toThrow();
});

it('throws on non-plain objects', () => {
	expect(() => encode(new Map([[1, 2]]))).toThrow();
});

function decodeCborMultiple(bytes: Uint8Array, expected: number): unknown[] {
	const values: unknown[] = [];

	for (let i = 0; i < expected; i++) {
		const [value, remaining] = decodeFirst(bytes);

		values.push(value);
		bytes = remaining;
	}

	expect(bytes.length).toBe(0);
	return values;
}
