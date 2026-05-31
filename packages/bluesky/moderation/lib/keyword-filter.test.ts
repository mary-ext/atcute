import { describe, expect, it } from 'vitest';

import { interpretMutedWordPreference } from './index.ts';
import { matchesKeywordFilters } from './internal/keyword-filter.ts';

describe('muted word expiry', () => {
	it('ignores an expired filter', () => {
		const filter = interpretMutedWordPreference({
			value: 'spoiler',
			targets: ['content'],
			expiresAt: '2000-01-01T00:00:00.000Z',
		});

		expect(filter.expiresAt).toBeTypeOf('number');
		expect(matchesKeywordFilters({ filters: [filter], text: 'a spoiler appears' })).toBe(null);
	});

	it('applies a filter that has not expired', () => {
		const filter = interpretMutedWordPreference({
			value: 'spoiler',
			targets: ['content'],
			expiresAt: '2999-01-01T00:00:00.000Z',
		});

		expect(matchesKeywordFilters({ filters: [filter], text: 'a spoiler appears' })).toBe(filter);
	});

	it('applies a filter with no expiry', () => {
		const filter = interpretMutedWordPreference({ value: 'spoiler', targets: ['content'] });

		expect(filter.expiresAt).toBeUndefined();
		expect(matchesKeywordFilters({ filters: [filter], text: 'a spoiler appears' })).toBe(filter);
	});
});

describe('tag matching', () => {
	it('matches a tag with a content-targeted filter', () => {
		const filter = interpretMutedWordPreference({ value: 'spoiler', targets: ['content'] });

		expect(matchesKeywordFilters({ filters: [filter], text: 'nothing here', tags: ['spoiler'] })).toBe(
			filter,
		);
	});

	it('matches a tag with a tag-targeted filter', () => {
		const filter = interpretMutedWordPreference({ value: 'spoiler', targets: ['tag'] });

		expect(matchesKeywordFilters({ filters: [filter], text: 'nothing here', tags: ['spoiler'] })).toBe(
			filter,
		);
	});

	it('does not match content with a tag-only filter', () => {
		const filter = interpretMutedWordPreference({ value: 'spoiler', targets: ['tag'] });

		expect(matchesKeywordFilters({ filters: [filter], text: 'a spoiler appears', tags: [] })).toBe(null);
	});
});
