import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryStore } from './memory-store.js';

describe('MemoryStore', () => {
	describe('basic operations', () => {
		it('should set and get values', () => {
			const store = new MemoryStore<string, number>({});
			store.set('a', 1);
			store.set('b', 2);

			expect(store.get('a')).toBe(1);
			expect(store.get('b')).toBe(2);
		});

		it('should return undefined for missing keys', () => {
			const store = new MemoryStore<string, number>({});

			expect(store.get('nonexistent')).toBeUndefined();
		});

		it('should delete values', () => {
			const store = new MemoryStore<string, number>({});
			store.set('a', 1);
			store.delete('a');

			expect(store.get('a')).toBeUndefined();
		});

		it('should clear all values', () => {
			const store = new MemoryStore<string, number>({});
			store.set('a', 1);
			store.set('b', 2);
			store.clear();

			expect(store.get('a')).toBeUndefined();
			expect(store.get('b')).toBeUndefined();
		});
	});

	describe('TTL expiration', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should expire values after TTL', () => {
			const store = new MemoryStore<string, number>({ ttl: 1000 });
			store.set('a', 1);

			expect(store.get('a')).toBe(1);

			vi.advanceTimersByTime(1001);

			expect(store.get('a')).toBeUndefined();
		});

		it('should not expire values before TTL', () => {
			const store = new MemoryStore<string, number>({ ttl: 1000 });
			store.set('a', 1);

			vi.advanceTimersByTime(500);

			expect(store.get('a')).toBe(1);
		});

		it('should refresh TTL on update', () => {
			const store = new MemoryStore<string, number>({ ttl: 1000 });
			store.set('a', 1);

			vi.advanceTimersByTime(500);
			store.set('a', 2); // refresh TTL

			vi.advanceTimersByTime(700);
			expect(store.get('a')).toBe(2); // should still exist

			vi.advanceTimersByTime(400);
			expect(store.get('a')).toBeUndefined(); // now expired
		});
	});

	describe('LRU eviction with maxSize', () => {
		it('should evict least recently used when at capacity', () => {
			const store = new MemoryStore<string, number>({ maxSize: 3 });
			store.set('a', 1);
			store.set('b', 2);
			store.set('c', 3);
			store.set('d', 4); // should evict 'a'

			expect(store.get('a')).toBeUndefined();
			expect(store.get('b')).toBe(2);
			expect(store.get('c')).toBe(3);
			expect(store.get('d')).toBe(4);
		});

		it('should update LRU order on get', () => {
			const store = new MemoryStore<string, number>({ maxSize: 3 });
			store.set('a', 1);
			store.set('b', 2);
			store.set('c', 3);

			store.get('a'); // 'a' is now most recently used
			store.set('d', 4); // should evict 'b'

			expect(store.get('a')).toBe(1);
			expect(store.get('b')).toBeUndefined();
		});
	});

	describe('combined TTL and LRU', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should handle both TTL and LRU together', () => {
			const store = new MemoryStore<string, number>({ maxSize: 3, ttl: 1000 });
			store.set('a', 1);
			store.set('b', 2);
			store.set('c', 3);

			// LRU eviction
			store.set('d', 4);
			expect(store.get('a')).toBeUndefined();

			// TTL expiration
			vi.advanceTimersByTime(1001);
			expect(store.get('b')).toBeUndefined();
		});
	});

	describe('dispose', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should clear timers on dispose', () => {
			const store = new MemoryStore<string, number>({ ttl: 1000, ttlAutopurge: true });
			store.set('a', 1);

			store.dispose();

			// should not throw or cause issues after dispose
			vi.advanceTimersByTime(2000);
		});

		it('should support Symbol.dispose', () => {
			const store = new MemoryStore<string, number>({ ttl: 1000, ttlAutopurge: true });
			store.set('a', 1);

			store[Symbol.dispose]();

			// should not throw
			vi.advanceTimersByTime(2000);
		});
	});
});
