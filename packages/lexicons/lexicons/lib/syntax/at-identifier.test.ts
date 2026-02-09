import { describe, expect, it } from 'vitest';

import { isActorIdentifier } from './at-identifier.ts';

describe('at-identifier validation', () => {
	it('validates at-identifier', () => {
		const validCases = [
			// allows valid handles
			'XX.LCS.MIT.EDU',
			'john.test',
			'jan.test',
			'a234567890123456789.test',
			'john2.test',
			'john-john.test',

			// allows valid DIDs
			'did:method:val',
			'did:method:VAL',
			'did:method:val123',
			'did:method:123',
			'did:method:val-two',
		];
		for (const case_ of validCases) {
			expect(isActorIdentifier(case_), case_).toBe(true);
		}

		const invalidCases = [
			// invalid handles
			'did:thing.test',
			'did:thing',
			'john-.test',
			'john.0',
			'john.-',
			'xn--bcher-.tld',
			'john..test',
			'jo_hn.test',

			// invalid DIDs
			'did',
			'didmethodval',
			'method:did:val',
			'did:method:',
			'didmethod:val',
			'did:methodval)',
			':did:method:val',
			'did:method:val:',
			'did:method:val%',
			'DID:method:val',

			// other invalid stuff
			'email@example.com',
			'@handle@example.com',
			'@handle',
			'blah',
		];
		for (const case_ of invalidCases) {
			expect(isActorIdentifier(case_), case_).toBe(false);
		}

		expect(isActorIdentifier(null)).toBe(false);
	});
});
