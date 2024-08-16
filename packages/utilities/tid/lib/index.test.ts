import { describe, it, expect, setSystemTime } from 'bun:test';

import * as TID from './index.js';

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
		setSystemTime(new Date('2024-08-16T14:58:10.161Z'));

		const tid1 = TID.now();
		expect(tid1).toStartWith('3kztss2uifc');

		const tid2 = TID.now();
		expect(tid2).toStartWith('3kztss2uifd');

		setSystemTime();
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
