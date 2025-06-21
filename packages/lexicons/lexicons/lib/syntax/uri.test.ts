import { describe, expect, it } from 'vitest';

import { isGenericUri } from './uri.js';

describe('uri validation', () => {
	it('validates uri', () => {
		const validCases = [
			'https://example.com',
			'https://example.com/path?q=blah&yes=true#frag.123',
			'dns:example.com',
			'at://handle.example.com/nsid/rkey',
			'did:key:zQ3shZc2QzApp2oymGvQbzP8eKheVshBHbU4ZYjeXqwSKEn6N',
			// 'content-type:text/plan',
			// 'microsoft.windows.camera:thing',
			'go://?Mercedes%20Benz',

			// long (but not too long)
			// python: "https://example.com/" + 5000*"x"
			'https://example.com/' + 'x'.repeat(5000),
		];
		for (const case_ of validCases) {
			expect(isGenericUri(case_), case_).toBe(true);
		}

		const invalidCases = [
			'example.com',
			'://example.com',
			'//example.com',
			'http:',
			'.http://example.com',
			'-http://example.com',
			'12345',
			'127.0.0.1',
			'https://example.com/path gap',
			'  https://example.com/path',
			'https://example.com/trailing-whitespace  ',
			// too long (max 8 kbytes): python: "https://example.com/" + 8200 *"x"
			'https://example.com/' + 'x'.repeat(8200),
		];
		for (const case_ of invalidCases) {
			expect(isGenericUri(case_), case_).toBe(false);
		}
	});
});