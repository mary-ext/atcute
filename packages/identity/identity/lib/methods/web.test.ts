import { describe, expect, it } from 'vitest';

import { normalizeWebDid } from './web.ts';

describe('normalizeWebDid', () => {
	it('lowercases the host', () => {
		expect(normalizeWebDid('did:web:Example.COM')).toBe('did:web:example.com');
	});

	it('preserves a percent-encoded port in the host', () => {
		expect(normalizeWebDid('did:web:localhost%3A3000')).toBe('did:web:localhost%3A3000');
	});

	it('leaves path segments verbatim, including their casing', () => {
		expect(normalizeWebDid('did:web:Example.com:Path:Sub')).toBe('did:web:example.com:Path:Sub');
	});

	it('does not split a percent-encoded colon inside a path segment', () => {
		expect(normalizeWebDid('did:web:Example.com:us%3Aer')).toBe('did:web:example.com:us%3Aer');
	});
});
