import { describe, expect, it } from 'vitest';

import { isTid } from './tid.js';

describe('tid validation', () => {
	it('validates tid', () => {
		const validCases = [
			// 13 digits
			// 234567abcdefghijklmnopqrstuvwxyz
			'3jzfcijpj2z2a',
			'7777777777777',
			'3zzzzzzzzzzzz',
			'2222222222222',
		];
		for (const case_ of validCases) {
			expect(isTid(case_), case_).toBe(true);
		}

		const invalidCases = [
			// not base32
			'3jzfcijpj2z21',
			'0000000000000',

			// case-sensitive
			'3JZFCIJPJ2Z2A',

			// too long/short
			'3jzfcijpj2z2aa',
			'3jzfcijpj2z2',
			'222',

			// old dashes syntax not actually supported (TTTT-TTT-TTTT-CC)
			'3jzf-cij-pj2z-2a',

			// high bit can't be high
			'zzzzzzzzzzzzz',
			'kjzfcijpj2z2a',
		];
		for (const case_ of invalidCases) {
			expect(isTid(case_), case_).toBe(false);
		}
	});
});