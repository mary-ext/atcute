import { expect, it, vi } from 'vitest';

import { fromBase32, toBase32 } from './base32.ts';

vi.mock('@atcute/uint8array', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@atcute/uint8array')>();
	return {
		...actual,
		allocUnsafe: (size: number): Uint8Array => {
			return crypto.getRandomValues(new Uint8Array(size));
		},
	};
});

const inputs = [
	{
		text: `Decentralize everything!!`,
		encoded: `irswgzloorzgc3djpjssazlwmvzhs5dinfxgoijb`,
	},
	{
		text: `yes mani !`,
		encoded: `pfsxgidnmfxgsibb`,
	},
	{
		text: `hello world`,
		encoded: `nbswy3dpeb3w64tmmq`,
	},
	{
		text: `\x00yes mani !`,
		encoded: `ab4wk4zanvqw42jaee`,
	},
	{
		text: `\x00\x00yes mani !`,
		encoded: `aaahszltebwwc3tjeaqq`,
	},
];

it('can encode', () => {
	const encoder = new TextEncoder();

	for (const { text, encoded } of inputs) {
		expect(toBase32(encoder.encode(text))).toBe(encoded);
	}
});

it('can decode', () => {
	const decoder = new TextDecoder();

	for (const { text, encoded } of inputs) {
		expect(decoder.decode(fromBase32(encoded))).toBe(text);
	}
});
