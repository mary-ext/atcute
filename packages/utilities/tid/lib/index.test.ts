import { afterEach, describe, expect, it, vi } from 'vitest';

import * as TID from './index.ts';

afterEach(() => {
	vi.useRealTimers();
});

describe('create', () => {
	it('creates a valid TID', () => {
		const tidString = TID.create(1723819911723_000, 490);

		expect(tidString).toEqual('3kztsgrxhzsje');
	});

	it('fails on negative or unsafe timestamp', () => {
		expect(() => TID.create(-1, 420)).toThrow('invalid timestamp');
		expect(() => TID.create(2 ** 53, 420)).toThrow('invalid timestamp');
	});

	it('fails on invalid clock id', () => {
		expect(() => TID.create(1, 0)).not.toThrow();
		expect(() => TID.create(1, 1023)).not.toThrow();

		expect(() => TID.create(1, -1)).toThrow('invalid clockid');
		expect(() => TID.create(1, 1024)).toThrow('invalid clockid');
	});
});

describe('now', () => {
	it('creates a TID based on system time', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2024-08-16T14:58:10.161Z'));

		const tid1 = TID.now();
		expect(tid1).toMatch(/^3kztss2uifc/);

		const tid2 = TID.now();
		expect(tid2).toMatch(/^3kztss2uifd/);
	});

	it('never reissues a timestamp when calls outpace the clock', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2024-08-16T15:00:00.000Z'));

		const seen = new Set<number>();

		// a fake millisecond is 1000 microseconds, so this overruns the clock by 500
		for (let idx = 0; idx < 1500; idx++) {
			seen.add(TID.parse(TID.now()).timestamp);
		}

		// the clock now ticks into timestamps the burst already handed out
		vi.advanceTimersByTime(1);

		for (let idx = 0; idx < 1000; idx++) {
			seen.add(TID.parse(TID.now()).timestamp);
		}

		expect(seen.size).toBe(2500);
	});

	it('follows the clock when it moves backwards', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2024-08-16T16:00:00.000Z'));

		const before = TID.parse(TID.now()).timestamp;

		const corrected = new Date('2024-08-16T15:30:00.000Z');
		vi.setSystemTime(corrected);

		const after = TID.parse(TID.now()).timestamp;

		expect(after).toBeLessThan(before);
		expect(after).toBe(corrected.getTime() * 1000);
	});
});

describe('parse', () => {
	it('parses valid TID', () => {
		const tid = TID.parse('3kztrqxakokct');

		expect(tid).toEqual({
			timestamp: 1723819179066_000,
			clockid: 281,
		});
	});

	it('throws on invalid code points', () => {
		expect(() => TID.parse('3kztrqxakokc💩')).toThrow('invalid TID');
	});
});

describe('validate', () => {
	describe('conforms to what interop considers valid', () => {
		it.each(['3jzfcijpj2z2a', '7777777777777', '3zzzzzzzzzzzz'])('%s', (tid) => {
			expect(TID.validate(tid)).toBe(true);
		});
	});

	describe('conforms to what interop considers invalid', () => {
		it.each([
			// not base32
			'3jzfcijpj2z21',
			'0000000000000',

			// too long/short
			'3jzfcijpj2z2aa',
			'3jzfcijpj2z2',

			// old dashes syntax not actually supported (TTTT-TTT-TTTT-CC)
			'3jzf-cij-pj2z-2a',

			// high bit can't be high
			'zzzzzzzzzzzzz',
			'kjzfcijpj2z2a',
		])('%s', (tid) => {
			expect(TID.validate(tid)).toBe(false);
		});
	});
});
