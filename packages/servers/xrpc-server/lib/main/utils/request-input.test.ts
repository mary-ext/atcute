import { describe, expect, it } from 'vitest';

import { constructMimeValidator } from './request-input.ts';

const check = (encoding: string[] | undefined, contentType: string): boolean => {
	const validator = constructMimeValidator({ type: 'blob', encoding });
	if (validator === null) {
		return true;
	}

	const request = new Request('http://example.com/', {
		method: 'POST',
		headers: { 'content-type': contentType },
	});

	return validator(request).ok;
};

describe('constructMimeValidator', () => {
	it('matches exact media types', () => {
		expect(check(['image/png'], 'image/png')).toBe(true);
		expect(check(['image/png'], 'image/jpeg')).toBe(false);
	});

	it('honors parameters and surrounding whitespace', () => {
		expect(check(['application/json'], 'application/json; charset=utf-8')).toBe(true);
		expect(check(['application/json'], '  application/json  ')).toBe(true);
	});

	it('expands subtype wildcards into a prefix match', () => {
		expect(check(['image/*'], 'image/png')).toBe(true);
		expect(check(['image/*'], 'image/svg+xml')).toBe(true);
		expect(check(['image/*'], 'image/png; charset=binary')).toBe(true);
		expect(check(['image/*'], 'video/mp4')).toBe(false);
		expect(check(['image/*'], 'image/')).toBe(false);
	});

	it('accepts any media type for */*', () => {
		expect(check(['*/*'], 'image/png')).toBe(true);
		expect(check(['*/*'], 'application/octet-stream')).toBe(true);
	});

	it('matches any alternative in the list', () => {
		expect(check(['image/*', 'application/pdf'], 'application/pdf')).toBe(true);
		expect(check(['image/*', 'application/pdf'], 'image/gif')).toBe(true);
		expect(check(['image/*', 'application/pdf'], 'text/plain')).toBe(false);
	});
});
