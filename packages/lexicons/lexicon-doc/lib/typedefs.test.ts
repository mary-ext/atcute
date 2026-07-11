import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { lexBlob, lexBytes, lexInteger, lexString, lexiconDoc } from './typedefs.ts';

describe('signed integer bounds', () => {
	it('accepts negative value bounds on lexInteger', () => {
		expect(v.is(lexInteger, { type: 'integer', minimum: -90, maximum: 90 })).toBe(true);
		expect(v.is(lexInteger, { type: 'integer', const: -5 })).toBe(true);
		expect(v.is(lexInteger, { type: 'integer', default: -1 })).toBe(true);
		expect(v.is(lexInteger, { type: 'integer', enum: [-1, 0, 1] })).toBe(true);
	});

	it('still rejects fractional value bounds on lexInteger', () => {
		expect(v.is(lexInteger, { type: 'integer', minimum: 1.5 })).toBe(false);
	});
});

describe('unsigned length/size bounds', () => {
	it('rejects negative lengths and sizes', () => {
		expect(v.is(lexString, { type: 'string', minLength: -1 })).toBe(false);
		expect(v.is(lexBytes, { type: 'bytes', maxLength: -3 })).toBe(false);
		expect(v.is(lexBlob, { type: 'blob', maxSize: -1 })).toBe(false);
	});

	it('rejects negative document revision', () => {
		expect(v.is(lexiconDoc, { lexicon: 1, id: 'com.example.foo', revision: -1, defs: {} })).toBe(false);
	});
});
