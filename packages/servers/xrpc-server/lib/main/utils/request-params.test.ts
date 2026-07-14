import * as v from '@atcute/lexicons/validations';

import { describe, expect, it } from 'vitest';

import { constructParamsHandler } from './request-params.ts';

const schema = v.object({
	repo: v.string(),
	limit: v.optional(v.integer(), 50),
	reverse: v.optional(v.boolean()),
	tags: v.optional(v.array(v.string())),
});

const parse = (query: string) => {
	const handle = constructParamsHandler(schema);
	return handle(new URLSearchParams(query));
};

const parseOk = (query: string) => {
	const result = parse(query);
	if (!result.ok) {
		throw new Error(`expected ${query} to parse, got ${result.message}`);
	}

	return result.value;
};

const parseErr = (query: string) => {
	const result = parse(query);
	if (result.ok) {
		throw new Error(`expected ${query} to fail, got ${JSON.stringify(result.value)}`);
	}

	return result.issues.map((issue) => issue.code);
};

describe('constructParamsHandler', () => {
	it('coerces decimal integers', () => {
		expect(parseOk('repo=a&limit=100')).toMatchObject({ limit: 100 });
		expect(parseOk('repo=a&limit=-5')).toMatchObject({ limit: -5 });
		expect(parseOk('repo=a&limit=007')).toMatchObject({ limit: 7 });
	});

	it('rejects integers that are not decimal notation', () => {
		expect(parseErr('repo=a&limit=0x10')).toEqual(['invalid_type']);
		expect(parseErr('repo=a&limit=1e2')).toEqual(['invalid_type']);
		expect(parseErr('repo=a&limit=0b101')).toEqual(['invalid_type']);
		expect(parseErr('repo=a&limit= 10 ')).toEqual(['invalid_type']);
		expect(parseErr('repo=a&limit=1.5')).toEqual(['invalid_type']);
		expect(parseErr('repo=a&limit=Infinity')).toEqual(['invalid_type']);
		expect(parseErr('repo=a&limit=invalid')).toEqual(['invalid_type']);
	});

	it('rejects integers beyond the safe range', () => {
		expect(parseErr('repo=a&limit=99999999999999999999')).toEqual(['invalid_type']);
	});

	it('treats an empty value as an absent parameter', () => {
		expect(parseOk('repo=a&limit=')).toEqual({ repo: 'a', limit: 50 });
		expect(parseOk('repo=a&reverse=')).toEqual({ repo: 'a', limit: 50 });
		expect(parseErr('repo=')).toEqual(['missing_value']);
	});

	it('drops empty values out of repeated parameters', () => {
		expect(parseOk('repo=a&tags=&tags=x')).toMatchObject({ tags: ['x'] });
	});

	it('leaves an absent array parameter unset', () => {
		expect(parseOk('repo=a')).toEqual({ repo: 'a', limit: 50 });
		expect(parseOk('repo=a&tags=')).toEqual({ repo: 'a', limit: 50 });

		const required = constructParamsHandler(v.object({ tags: v.array(v.string()) }));
		expect(required(new URLSearchParams('')).ok).toBe(false);
	});

	it('still rejects malformed booleans', () => {
		expect(parseErr('repo=a&reverse=1')).toEqual(['invalid_type']);
	});

	it('rejects a repeated value for a scalar parameter', () => {
		expect(parseErr('repo=a&limit=1&limit=2')).toEqual(['invalid_type']);
	});
});
