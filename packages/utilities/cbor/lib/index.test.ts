import { expect, it } from 'bun:test';

import * as CID from '@atcute/cid';

import { decode, decodeFirst, encode, toBytes, toCIDLink } from './index.js';

const utf8e = new TextEncoder();
// const utf8d = new TextDecoder();

it('encodes and decodes into the same value', () => {
	const object = {
		key: 'value',
		link: toCIDLink(CID.parse('bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee')),
		bytes: toBytes(utf8e.encode('lorem ipsum sit dolor amet')),
		answer: 42,
		correct: true,
		wrong: false,
		empty: undefined,
		blank: null,
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

it('encodes this atproto post record', async () => {
	const record = {
		$type: 'app.bsky.feed.post',
		createdAt: '2024-08-13T01:16:06.453Z',
		embed: {
			$type: 'app.bsky.embed.images',
			images: [
				{
					alt: 'a photoshopped picture of kit with a microphone. kit is saying "meow"',
					aspectRatio: {
						height: 885,
						width: 665,
					},
					image: {
						$type: 'blob',
						ref: {
							$link: 'bafkreic6hvmy3ymbo25wxsvylu77r57uwhtnviu7vmhfsns3ab4xfal5ou',
						},
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

	expect(CID.format(await CID.create(0x71, encoded))).toBe(
		'bafyreicbb3p4hmtm7iw3k7kiydzqp7qhufq3jdc5sbc4gxa4mxqd6bywba',
	);
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
