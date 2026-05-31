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
