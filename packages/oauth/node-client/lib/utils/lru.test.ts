import { describe, expect, it } from 'vitest';

import { LRUCache } from './lru.js';

describe('LRUCache', () => {
	describe('basic operations', () => {
		it('should set and get values', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);

			expect(cache.get('a')).toBe(1);
			expect(cache.get('b')).toBe(2);
			expect(cache.get('c')).toBeUndefined();
		});

		it('should update existing values', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('a', 10);

			expect(cache.get('a')).toBe(10);
		});

		it('should delete values', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);

			expect(cache.delete('a')).toBe(true);
			expect(cache.get('a')).toBeUndefined();
			expect(cache.delete('a')).toBe(false);
			expect(cache.get('b')).toBe(2);
		});

		it('should clear all values', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.clear();

			expect(cache.get('a')).toBeUndefined();
			expect(cache.get('b')).toBeUndefined();
		});

		it('should check if key exists', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);

			expect(cache.has('a')).toBe(true);
			expect(cache.has('b')).toBe(false);
		});
	});

	describe('LRU eviction', () => {
		it('should evict least recently used when at capacity', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);
			cache.set('d', 4); // should evict 'a'

			expect(cache.get('a')).toBeUndefined();
			expect(cache.get('b')).toBe(2);
			expect(cache.get('c')).toBe(3);
			expect(cache.get('d')).toBe(4);
		});

		it('should update LRU order on get', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);

			cache.get('a'); // 'a' is now most recently used
			cache.set('d', 4); // should evict 'b' (least recently used)

			expect(cache.get('a')).toBe(1);
			expect(cache.get('b')).toBeUndefined();
			expect(cache.get('c')).toBe(3);
			expect(cache.get('d')).toBe(4);
		});

		it('should update LRU order on set (existing key)', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);

			cache.set('a', 10); // 'a' is now most recently used
			cache.set('d', 4); // should evict 'b'

			expect(cache.get('a')).toBe(10);
			expect(cache.get('b')).toBeUndefined();
		});

		it('should not update LRU order on peek', () => {
			const cache = new LRUCache<string, number>(3);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);

			cache.peek('a'); // should NOT update LRU order
			cache.set('d', 4); // should evict 'a' (still least recently used)

			expect(cache.peek('a')).toBeUndefined();
			expect(cache.get('b')).toBe(2);
		});
	});

	describe('iteration', () => {
		it('should iterate keys in LRU order (most to least recent)', () => {
			const cache = new LRUCache<string, number>(5);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);
			cache.get('a'); // move 'a' to front

			const keys = [...cache.keys()];
			expect(keys).toEqual(['a', 'c', 'b']);
		});

		it('should iterate values in LRU order', () => {
			const cache = new LRUCache<string, number>(5);
			cache.set('a', 1);
			cache.set('b', 2);
			cache.set('c', 3);

			const values = [...cache.values()];
			expect(values).toEqual([3, 2, 1]);
		});

		it('should iterate entries in LRU order', () => {
			const cache = new LRUCache<string, number>(5);
			cache.set('a', 1);
			cache.set('b', 2);

			const entries = [...cache.entries()];
			expect(entries).toEqual([
				['b', 2],
				['a', 1],
			]);
		});

		it('should be iterable with for-of', () => {
			const cache = new LRUCache<string, number>(5);
			cache.set('a', 1);
			cache.set('b', 2);

			const entries: [string, number][] = [];
			for (const entry of cache) {
				entries.push(entry);
			}

			expect(entries).toEqual([
				['b', 2],
				['a', 1],
			]);
		});
	});

	describe('edge cases', () => {
		it('should handle cache of size 1', () => {
			const cache = new LRUCache<string, number>(1);
			cache.set('a', 1);
			cache.set('b', 2);

			expect(cache.get('a')).toBeUndefined();
			expect(cache.get('b')).toBe(2);
		});

		it('should handle empty cache iteration', () => {
			const cache = new LRUCache<string, number>(3);

			expect([...cache.keys()]).toEqual([]);
			expect([...cache.values()]).toEqual([]);
			expect([...cache.entries()]).toEqual([]);
		});

		it('should report correct size', () => {
			const cache = new LRUCache<string, number>(5);
			expect(cache.size).toBe(5);
		});
	});
});
