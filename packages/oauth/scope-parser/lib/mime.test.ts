import { describe, expect, it } from 'vitest';

import { isAccept, isMime, matchesAccept, matchesAnyAccept } from './mime.js';

describe('isMime', () => {
	it('accepts valid MIME types', () => {
		expect(isMime('image/png')).toBe(true);
		expect(isMime('application/json')).toBe(true);
		expect(isMime('text/html')).toBe(true);
	});

	it('rejects wildcards', () => {
		expect(isMime('image/*')).toBe(false);
		expect(isMime('*/*')).toBe(false);
	});

	it('rejects invalid formats', () => {
		expect(isMime('image/png/extra')).toBe(false);
		expect(isMime('*/mime')).toBe(false);
		expect(isMime('/png')).toBe(false);
		expect(isMime('image/')).toBe(false);
		expect(isMime('image')).toBe(false);
		expect(isMime('image/ png')).toBe(false);
		expect(isMime('image//png')).toBe(false);
	});
});

describe('isAccept', () => {
	it('accepts valid MIME types', () => {
		expect(isAccept('image/png')).toBe(true);
		expect(isAccept('application/json')).toBe(true);
		expect(isAccept('text/html')).toBe(true);
	});

	it('accepts wildcards', () => {
		expect(isAccept('image/*')).toBe(true);
		expect(isAccept('*/*')).toBe(true);
	});

	it('rejects invalid wildcards', () => {
		expect(isAccept('image/**')).toBe(false);
		expect(isAccept('*/png')).toBe(false);
		expect(isAccept('*')).toBe(false);
	});

	it('rejects invalid formats', () => {
		expect(isAccept('image//png')).toBe(false);
		expect(isAccept('/png')).toBe(false);
		expect(isAccept('image/')).toBe(false);
		expect(isAccept('image/png/extra')).toBe(false);
	});
});

describe('matchesAccept', () => {
	it('matches exact MIME type', () => {
		expect(matchesAccept('image/png', 'image/png')).toBe(true);
		expect(matchesAccept('image/png', 'image/jpeg')).toBe(false);
	});

	it('matches with full wildcard', () => {
		expect(matchesAccept('*/*', 'image/png')).toBe(true);
		expect(matchesAccept('*/*', 'application/json')).toBe(true);
		expect(matchesAccept('*/*', 'text/html')).toBe(true);
	});

	it('matches with subtype wildcard', () => {
		expect(matchesAccept('image/*', 'image/png')).toBe(true);
		expect(matchesAccept('image/*', 'image/jpeg')).toBe(true);
		expect(matchesAccept('image/*', 'image/gif')).toBe(true);
		expect(matchesAccept('image/*', 'text/html')).toBe(false);
		expect(matchesAccept('image/*', 'application/json')).toBe(false);
	});

	it('rejects invalid MIME types', () => {
		expect(matchesAccept('image/png', '*/mime')).toBe(false);
		expect(matchesAccept('image/png', 'image')).toBe(false);
		expect(matchesAccept('image/*', 'image//png')).toBe(false);
		expect(matchesAccept('image/*', 'image/ png')).toBe(false);
		expect(matchesAccept('*/*', 'image/')).toBe(false);
		expect(matchesAccept('*/*', '/mime')).toBe(false);
	});
});

describe('matchesAnyAccept', () => {
	it('returns false for empty array', () => {
		expect(matchesAnyAccept([], 'image/png')).toBe(false);
	});

	it('matches when any pattern matches', () => {
		expect(matchesAnyAccept(['image/*'], 'image/jpeg')).toBe(true);
		expect(matchesAnyAccept(['image/*'], 'text/html')).toBe(false);
		expect(matchesAnyAccept(['image/png', 'application/json'], 'image/png')).toBe(true);
		expect(matchesAnyAccept(['image/png', 'application/json'], 'text/html')).toBe(false);
	});
});
