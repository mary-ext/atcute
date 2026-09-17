import { describe, expect, it } from 'vitest';

import { enableCompilation } from './compile.ts';
import * as v from './index.ts';

enableCompilation();

const reject: v.BaseConstraint = {
	kind: 'constraint',
	type: 'reject',
	'~run'() {
		return { ok: false, code: 'missing_value', msg: () => `rejected` };
	},
};

describe('compiled validation', () => {
	it('matches the interpreter on valid and invalid input', () => {
		const schema = v.object({
			list: v.array(v.object({ n: v.integer() })),
			name: v.literal('alice'),
		});

		expect(v.is(schema, { list: [{ n: 1 }], name: 'alice' })).toBe(true);
		expect(v.is(schema, { list: [{ n: 'x' }], name: 'alice' })).toBe(false);

		const result = v.safeParse(schema, { list: [{ n: 1 }, { n: 'x' }], name: 'bob' });
		expect(result.ok).toBe(false);
		expect(!result.ok && result.issues).toEqual([
			{ code: 'invalid_type', expected: 'integer', path: ['list', 1, 'n'] },
			{ code: 'invalid_literal', expected: ['alice'], path: ['name'] },
		]);
	});

	it('applies constraints on variant and record members', () => {
		const member = v.constrain(v.object({ $type: v.literal('com.example.foo') }), [reject]);

		expect(v.is(v.variant([member]), { $type: 'com.example.foo' })).toBe(false);
		expect(v.is(v.array(v.record(v.string(), member)), [{ $type: 'com.example.foo' }])).toBe(false);
	});

	it('respects matchers overridden by derived schemas', () => {
		const derived: v.BaseSchema = Object.defineProperty(Object.create(v.string()), '~run', {
			value: () => ({ ok: false, code: 'missing_value', msg: () => `rejected` }),
		});

		expect(v.is(v.array(derived), ['bad'])).toBe(false);
	});

	it('compiles schemas derived without overriding the matcher', () => {
		const derived: v.StringSchema = Object.create(v.string());

		expect(v.is(v.array(derived), ['ok'])).toBe(true);
		expect(v.is(v.array(derived), [1])).toBe(false);
	});

	it('preserves transforms that keep the same value', () => {
		const zero: v.BaseConstraint<number> = {
			kind: 'constraint',
			type: 'zero',
			'~run'(input) {
				return input === 0 ? v.ok(0) : undefined;
			},
		};

		const input = { x: -0 };
		const output = v.parse(v.object({ x: v.constrain(v.integer(), [zero]) }), input);
		expect(output).not.toBe(input);
		expect(Object.is(output.x, 0)).toBe(true);

		// a default factory returning `undefined` still fills a hole
		const holey: string[] = [];
		holey[1] = 'a';

		const sparse = v.parse(v.array(v.optional(v.string(), () => undefined as any)), holey);
		expect(0 in sparse).toBe(true);
	});

	it('converts legacy blobs and applies defaults', () => {
		const schema = v.object({
			flag: v.optional(v.boolean(), false),
			image: v.blob(),
		});

		const legacy = {
			cid: 'bafkreibjfybaa44yecbited3s6i3swbvh4eebh2z7n3mtwyw3r3lykyjwe',
			mimeType: 'image/png',
		};

		expect(v.parse(schema, { image: legacy })).toEqual({
			flag: false,
			image: { $type: 'blob', mimeType: 'image/png', ref: { $link: legacy.cid }, size: -1 },
		});
		expect(v.is(schema, { image: legacy }, { strict: true })).toBe(false);
	});

	it('handles recursive schemas', () => {
		const node = v.object({
			get children() {
				return v.optional(v.array(node));
			},
			value: v.integer(),
		});

		expect(v.is(node, { children: [{ children: [{ value: 3 }], value: 2 }], value: 1 })).toBe(true);
		expect(v.is(node, { children: [{ children: [{ value: 'x' }], value: 2 }], value: 1 })).toBe(false);
	});
});
