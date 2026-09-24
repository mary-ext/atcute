import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { computeKeyHeight } from './key-height.ts';

// reference implementation, counting 2-bit chunks bytewise
const reference = (key: string): number => {
	const hash = createHash('sha256').update(key).digest();

	let lz = 0;
	for (const byte of hash) {
		if (byte < 64) {
			lz++;
		}
		if (byte < 16) {
			lz++;
		}
		if (byte < 4) {
			lz++;
		}

		if (byte === 0) {
			lz++;
		} else {
			break;
		}
	}

	return lz;
};

describe('computeKeyHeight', () => {
	it('matches known heights', () => {
		// from the atproto interop test vectors
		expect(computeKeyHeight('')).toBe(0);
		expect(computeKeyHeight('asdf')).toBe(0);
		expect(computeKeyHeight('blue')).toBe(1);
		expect(computeKeyHeight('2653ae71')).toBe(0);
		expect(computeKeyHeight('88bfafc7')).toBe(2);
		expect(computeKeyHeight('2a92d355')).toBe(4);
		expect(computeKeyHeight('884976f5')).toBe(6);
		expect(computeKeyHeight('app.bsky.feed.post/454397e440ec')).toBe(4);
		expect(computeKeyHeight('app.bsky.feed.post/9adeb165882c')).toBe(8);
	});

	it('matches a bytewise reference', () => {
		for (let idx = 0; idx < 5_000; idx++) {
			const key = `com.example.record/${idx.toString(36)}`;
			expect(computeKeyHeight(key), key).toBe(reference(key));
		}
	});
});
