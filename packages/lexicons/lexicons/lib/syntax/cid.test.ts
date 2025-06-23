import { describe, expect, it } from 'vitest';

import { isCid } from './cid.js';

describe('cid validation', () => {
	it('validates cid', () => {
		const validCases = [
			// examples from https://docs.ipfs.tech/concepts/content-addressing
			'bafyreigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',

			// https://github.com/ipfs-shipyard/is-ipfs/blob/master/test/test-cid.spec.ts
			// 'zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7',
			// 'bafybeie5gq4jxvzmsym6hjlwxej4rwdoxt7wadqvmmwbqi7r27fclha2va',

			// more contrived examples
			// 'mBcDxtdWx0aWhhc2g+',
			// 'z7x3CtScH765HvShXT',
			// 'zdj7WhuEjrB52m1BisYCtmjH1hSKa7yZ3jEZ9JcXaFRD51wVz',
			// '7134036155352661643226414134664076',
			// 'f017012202c5f688262e0ece8569aa6f94d60aad55ca8d9d83734e4a7430d0cff6588ec2b',
		];
		for (const case_ of validCases) {
			expect(isCid(case_), case_).toBe(true);
		}

		const invalidCases = [
			'example.com',
			'https://example.com',
			'cid:bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
			'.',
			'12345',

			// whitespace
			' bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
			'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi ',
			'bafybe igdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',

			// old CIDv0 not supported
			'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR',

			// https://github.com/ipfs-shipyard/is-ipfs/blob/master/test/test-cid.spec.ts
			'noop',
		];
		for (const case_ of invalidCases) {
			expect(isCid(case_), case_).toBe(false);
		}
	});
});
