import { describe, expect, it } from 'vitest';

import { isRecordKey } from './record-key.js';

describe('record key validation', () => {
	it('validates record key', () => {
		const validCases = [
			// specs
			'self',
			'example.com',
			'~1.2-3_',
			'dHJ1ZQ',
			'_',
			'literal:self',
			'pre:fix',
			// more corner-cases
			':',
			'-',
			'~',
			'...',
			'self.',
			'lang:',
			':lang',
			// very long: 'o'.repeat(512)
			'o'.repeat(512),
		];
		for (const case_ of validCases) {
			expect(isRecordKey(case_), case_).toBe(true);
		}

		const invalidCases = [
			// specs
			'alpha/beta',
			'.',
			'..',
			'#extra',
			'@handle',
			'any space',
			'any+space',
			'number[3]',
			'number(3)',
			'"quote"',
			'dHJ1ZQ==',
			// too long: 'o'.repeat(513)
			'o'.repeat(513),
		];
		for (const case_ of invalidCases) {
			expect(isRecordKey(case_), case_).toBe(false);
		}
	});
});
