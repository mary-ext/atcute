import { describe, expect, it } from 'vitest';

import { encodeKey } from './keys.ts';

describe('encodeKey', () => {
	it('encodes ASCII and falls back to UTF-8', () => {
		expect(encodeKey('app.bsky.feed.post/3ka000')).toEqual(
			new TextEncoder().encode('app.bsky.feed.post/3ka000'),
		);
		expect(encodeKey('a/ü€😀')).toEqual(new TextEncoder().encode('a/ü€😀'));
	});
});
