import { describe, expect, it } from 'vitest';

import { memoryCursorStore } from './cursor.ts';

describe('memoryCursorStore', () => {
	it('starts from the live tip and remembers the saved position', async () => {
		const store = memoryCursorStore();
		expect(await store.load()).toBe(undefined);

		await store.save(42);
		expect(await store.load()).toBe(42);
	});

	it('starts from the given position', async () => {
		const store = memoryCursorStore(12);
		expect(await store.load()).toBe(12);
	});
});
