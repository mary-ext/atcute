import { describe, expect, it } from 'vitest';

import { isDid } from './did.js';

describe('did validation', () => {
	it('validates did', () => {
		const validCases = [
			'did:method:val',
			'did:method:VAL',
			'did:method:val123',
			'did:method:123',
			'did:method:val-two',
			'did:method:val_two',
			'did:method:val.two',
			'did:method:val:two',
			'did:method:val%BB',
			'did:method:' + 'v'.repeat(200),
			'did:m:v',
			'did:method::::val',
			'did:method:-',
			'did:method:-:_:.:%ab',
			'did:method:.',
			'did:method:_',
			'did:method::.',

			// allows some real DID values
			'did:onion:2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid',
			'did:example:123456789abcdefghi',
			'did:plc:7iza6de2dwap2sbkpav7c6c6',
			'did:web:example.com',
			'did:web:localhost%3A1234',
			'did:key:zQ3shZc2QzApp2oymGvQbzP8eKheVshBHbU4ZYjeXqwSKEn6N',
			'did:ethr:0xb9c5714089478a327f09197987f16f9e5d936e8a',
		];
		for (const case_ of validCases) {
			expect(isDid(case_), case_).toBe(true);
		}

		const invalidCases = [
			'did',
			'didmethodval',
			'method:did:val',
			'did:method:',
			'didmethod:val',
			'did:methodval)',
			':did:method:val',
			'did.method.val',
			'did:method:val:',
			'did:method:val%',
			'DID:method:val',
			'did:METHOD:val',
			'did:m123:val',
			'did:method:val/two',
			'did:method:val?two',
			'did:method:val#two',
		];
		for (const case_ of invalidCases) {
			expect(isDid(case_), case_).toBe(false);
		}
	});
});
