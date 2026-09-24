import { describe, expect, it } from 'vitest';

import { toCidLink, toLinkBytes } from './cid-link.ts';
import { fromString } from './codec.ts';

describe('toLinkBytes', () => {
	it('reads bytes from wrapped and plain CID links', () => {
		const str = 'bafyreihffx5a2e7k5uwrmmgofbvzujc5cmw5h4espouwuxt3liqoflx3ee';
		const cid = fromString(str);

		expect(toLinkBytes(toCidLink(cid))).toEqual(cid.bytes);
		expect(toLinkBytes({ $link: str })).toEqual(cid.bytes);
	});

	it('fails on invalid CID strings', () => {
		expect(() => toLinkBytes({ $link: 'bafyreaa' })).toThrow(`not a valid cid string`);
	});
});
