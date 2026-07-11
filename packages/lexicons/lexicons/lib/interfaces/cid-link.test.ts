import { describe, expect, it } from 'vitest';

import { isCidLink } from './cid-link.ts';

describe('isCidLink', () => {
	const cid = 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a';

	it('accepts a bare cid-link', () => {
		expect(isCidLink({ $link: cid })).toBe(true);
	});

	it('rejects extra keys', () => {
		expect(isCidLink({ $link: cid, extra: true })).toBe(false);
	});

	it('rejects an invalid $link', () => {
		expect(isCidLink({ $link: 'not-a-cid' })).toBe(false);
	});

	it('rejects null and primitives', () => {
		expect(isCidLink(null)).toBe(false);
		expect(isCidLink('string')).toBe(false);
		expect(isCidLink(123)).toBe(false);
	});
});
