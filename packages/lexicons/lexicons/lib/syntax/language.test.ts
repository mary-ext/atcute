import { describe, expect, it } from 'vitest';

import { isLanguageCode } from './language.js';

describe('language code validation', () => {
	it('validates language code', () => {
		const validCases = [
			'ja',
			'ban',
			'pt-BR',
			'hy-Latn-IT-arevela',
			'en-GB',
			'zh-Hant',
			'sgn-BE-NL',
			'es-419',
			'en-GB-boont-r-extended-sequence-x-private',

			// grandfathered
			'zh-hakka',
			'i-default',
			'i-navajo',

			// https://github.com/sebinsua/ietf-language-tag-regex/blob/master/test.js
			'de-CH-1901',
			'qaa-Qaaa-QM-x-southern',
		];
		for (const case_ of validCases) {
			expect(isLanguageCode(case_), case_).toBe(true);
		}

		const invalidCases = [
			// 'jaja',
			'.',
			'123',
			// 'JA',
			'j',
			'ja-',
			'a-DE',
		];
		for (const case_ of invalidCases) {
			expect(isLanguageCode(case_), case_).toBe(false);
		}
	});
});
