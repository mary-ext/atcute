import { toBytes } from '@atcute/cbor';
import { fromBase64 } from '@atcute/multibase';

import { assert, describe, expect, it, vi } from 'vitest';

import * as v from './index.ts';
import { allowsEval } from './utils.ts';

describe(`validation errors`, () => {
	it(`throws ValidationError`, () => {
		const schema = v.literal('alice');

		{
			const result = v.safeParse(schema, 'bob');

			assert(!result.ok);
			expect(() => result.throw()).toThrow(v.ValidationError);
		}

		{
			let caught: any;

			try {
				v.parse(schema, 'mallory');
			} catch (err) {
				caught = err;
			}

			if (caught === undefined) {
				expect.fail(`expected validation to throw`);
			}

			expect(caught).toBeInstanceOf(v.ValidationError);
			expect(caught).toEqual(
				expect.objectContaining({
					name: 'ValidationError',
					message: 'invalid_literal at . (expected "alice")',
				}),
			);
		}
	});
});

describe(`literal types`, () => {
	it(`validates string literal values`, () => {
		const schema = v.literal('bob');

		expect(v.is(schema, 'bob')).toBe(true);
		expect(v.is(schema, 'alice')).toBe(false);

		expect(v.is(schema, false)).toBe(false);
		expect(v.is(schema, true)).toBe(false);
		expect(v.is(schema, 0)).toBe(false);
		expect(v.is(schema, 1)).toBe(false);

		{
			const result = v.safeParse(schema, 'mallory');

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_literal at . (expected "bob")');
			expect(result.issues).toEqual([{ code: 'invalid_literal', expected: ['bob'], path: [] }]);
		}

		{
			const result = v.safeParse(schema, 123);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_literal at . (expected "bob")');
			expect(result.issues).toEqual([{ code: 'invalid_literal', expected: ['bob'], path: [] }]);
		}
	});

	it(`validates string enum values`, () => {
		const schema = v.literalEnum(['alice', 'bob', 'eris']);

		expect(v.is(schema, 'alice')).toBe(true);
		expect(v.is(schema, 'bob')).toBe(true);
		expect(v.is(schema, 'mallory')).toBe(false);

		expect(v.is(schema, false)).toBe(false);
		expect(v.is(schema, true)).toBe(false);
		expect(v.is(schema, 0)).toBe(false);
		expect(v.is(schema, 1)).toBe(false);

		{
			const result = v.safeParse(schema, 'mallory');

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_literal at . (expected "alice", "bob" or "eris")');
			expect(result.issues).toEqual([
				{ code: 'invalid_literal', expected: ['alice', 'bob', 'eris'], path: [] },
			]);
		}

		{
			const result = v.safeParse(schema, 123);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_literal at . (expected "alice", "bob" or "eris")');
			expect(result.issues).toEqual([
				{ code: 'invalid_literal', expected: ['alice', 'bob', 'eris'], path: [] },
			]);
		}
	});

	it.todo(`validates integer literal values`, () => {});

	it.todo(`validates integer enum values`, () => {});
});

describe(`primitive types`, () => {
	it(`validates boolean type`, () => {
		const schema = v.boolean();

		expect(v.is(schema, false)).toBe(true);
		expect(v.is(schema, true)).toBe(true);

		expect(v.is(schema, 0)).toBe(false);
		expect(v.is(schema, 1)).toBe(false);
		expect(v.is(schema, '')).toBe(false);
		expect(v.is(schema, 'hello')).toBe(false);

		{
			const result = v.safeParse(schema, 'world');

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected boolean)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'boolean', path: [] }]);
		}
	});

	it(`validates integer type`, () => {
		const schema = v.integer();

		expect(v.is(schema, 0)).toBe(true);
		expect(v.is(schema, 1)).toBe(true);
		expect(v.is(schema, Number.MAX_SAFE_INTEGER)).toBe(true);

		expect(v.is(schema, -2)).toBe(false);
		expect(v.is(schema, 1.23)).toBe(false);
		expect(v.is(schema, Number.MAX_SAFE_INTEGER + 1)).toBe(false);

		expect(v.is(schema, false)).toBe(false);
		expect(v.is(schema, true)).toBe(false);
		expect(v.is(schema, '')).toBe(false);
		expect(v.is(schema, 'hello')).toBe(false);

		{
			const result = v.safeParse(schema, -2);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected integer)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'integer', path: [] }]);
		}

		{
			const result = v.safeParse(schema, 'world');

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected integer)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'integer', path: [] }]);
		}
	});

	it(`validates string type`, () => {
		const schema = v.string();

		expect(v.is(schema, '')).toBe(true);
		expect(v.is(schema, 'hello')).toBe(true);

		expect(v.is(schema, false)).toBe(false);
		expect(v.is(schema, true)).toBe(false);
		expect(v.is(schema, 0)).toBe(false);
		expect(v.is(schema, 1)).toBe(false);

		{
			const result = v.safeParse(schema, 123);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected string)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'string', path: [] }]);
		}
	});

	it(`validates unknown type`, () => {
		const schema = v.unknown();

		expect(v.is(schema, { hello: 'world' })).toBe(true);
		expect(v.is(schema, {})).toBe(true);

		expect(v.is(schema, 'hello')).toBe(false);
		expect(v.is(schema, 123)).toBe(false);

		{
			const result = v.safeParse(schema, 123);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected unknown)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'unknown', path: [] }]);
		}
	});
});

it(`validates blob type`, () => {
	const schema = v.blob();

	expect(
		v.is(schema, {
			$type: 'blob',
			ref: { $link: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a' },
			mimeType: 'image/png',
			size: 1024,
		}),
	).toBe(true);

	expect(
		v.is(schema, {
			cid: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34',
			mimeType: 'image/jpeg',
		}),
	).toBe(true);

	expect(
		v.is(schema, {
			$type: 'blob',
			ref: { $link: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a' },
			mimeType: 'image/png',
			size: 1024,
			extra: 'hello',
		}),
	).toBe(false);

	expect(
		v.is(schema, {
			$type: 'blob',
			ref: { $link: '' },
			mimeType: 'image/png',
			size: 1024,
		}),
	).toBe(false);

	expect(
		v.is(schema, {
			cid: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34',
			mimeType: 'image/jpeg',
			extra: 'hello',
		}),
	).toBe(false);

	{
		const converted = v.parse(schema, {
			cid: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34',
			mimeType: 'image/jpeg',
		});

		expect(converted).toEqual({
			$type: 'blob',
			mimeType: 'image/jpeg',
			ref: { $link: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34' },
			size: -1,
		});
	}

	{
		const result = v.safeParse(schema, 123);

		assert(!result.ok, `expected validation issue`);
		expect(result.message).toBe('invalid_type at . (expected blob)');
		expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'blob', path: [] }]);
	}
});

describe(`IPLD types`, () => {
	it(`validates bytes type`, () => {
		const schema = v.bytes();

		expect(v.is(schema, { $bytes: 'a2VsaW5jaQ==' })).toBe(true);
		expect(v.is(schema, { $bytes: 'YnVubnk=' })).toBe(true);
		expect(v.is(schema, { $bytes: '' })).toBe(true);

		expect(v.is(schema, toBytes(new Uint8Array([1, 2, 3])))).toBe(true);

		expect(v.is(schema, { $bytes: 'a2VsaW5jaQ===' })).toBe(false);
		expect(v.is(schema, { $bytes: 'a2VsaW5jaQ=' })).toBe(false);
		expect(v.is(schema, { $bytes: 'a2VsaW5j@Q==' })).toBe(false);
		expect(v.is(schema, { $bytes: 'a2Vs aW5jaQ==' })).toBe(false);
		expect(v.is(schema, { $bytes: '=' })).toBe(false);
		expect(v.is(schema, { $bytes: '!' })).toBe(false);

		{
			const result = v.safeParse(schema, 123);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected bytes)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'bytes', path: [] }]);
		}

		{
			const result = v.safeParse(schema, { $bytes: '=' });

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected bytes)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'bytes', path: [] }]);
		}
	});

	it(`validates cid-link type`, () => {
		const schema = v.cidLink();

		expect(v.is(schema, { $link: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a' })).toBe(true);

		expect(v.is(schema, { $link: '' })).toBe(false);

		{
			const result = v.safeParse(schema, 123);

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected cid-link)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'cid-link', path: [] }]);
		}

		{
			const result = v.safeParse(schema, { $link: '' });

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_type at . (expected cid-link)');
			expect(result.issues).toEqual([{ code: 'invalid_type', expected: 'cid-link', path: [] }]);
		}
	});
});

it(`validates nullable type`, () => {
	const schema = v.nullable(v.string());

	expect(v.is(schema, 'abc')).toBe(true);
	expect(v.is(schema, null)).toBe(true);

	expect(v.is(schema, undefined)).toBe(false);
	expect(v.is(schema, 123)).toBe(false);
});

it(`validates optional type`, () => {
	{
		const schema = v.optional(v.integer());

		expect(v.is(schema, 123)).toBe(true);
		expect(v.parse(schema, undefined)).toBe(undefined);

		expect(v.is(schema, null)).toBe(false);
		expect(v.is(schema, 'abc')).toBe(false);
	}

	{
		const schema = v.optional(v.integer(), 234);

		expect(v.is(schema, 123)).toBe(true);
		expect(v.parse(schema, undefined)).toBe(234);

		expect(v.is(schema, null)).toBe(false);
		expect(v.is(schema, 'abc')).toBe(false);
	}

	{
		let count = 0;

		const schema = v.optional(v.integer(), () => ++count);

		expect(v.is(schema, 123)).toBe(true);
		expect(v.parse(schema, undefined)).toBe(1);
		expect(v.parse(schema, undefined)).toBe(2);

		expect(v.is(schema, null)).toBe(false);
		expect(v.is(schema, 'abc')).toBe(false);
	}
});

describe(`complex types`, () => {
	// currently hardwired to v.literal()
	it.todo(`validates token type`, () => {});

	it(`validates array type`, () => {
		{
			const schema = v.array(v.literalEnum(['alice', 'bob', 'mallory', 'frank']));

			expect(v.is(schema, ['alice', 'bob', 'mallory'])).toBe(true);
			expect(v.is(schema, [])).toBe(true);

			expect(v.is(schema, ['alice', 'grace', 'bob'])).toBe(false);

			expect(v.is(schema, 123)).toBe(false);

			{
				const result = v.safeParse(schema, ['alice', 'olivia', 'walter']);

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe(
					'invalid_literal at .1 (expected "alice", "bob", "mallory" or "frank") (+1 other issue(s))',
				);
				expect(result.issues).toEqual([
					{ code: 'invalid_literal', expected: ['alice', 'bob', 'mallory', 'frank'], path: [1] },
					{ code: 'invalid_literal', expected: ['alice', 'bob', 'mallory', 'frank'], path: [2] },
				]);
			}
		}

		{
			const schema = v.array(v.optional(v.string(), 'erin'));

			expect(v.parse(schema, ['alice', undefined])).toEqual(['alice', 'erin']);
		}
	});

	describe(`validates object type`, () => {
		it(`with eval`, () => {
			using _mock = vi.spyOn(allowsEval, 'value', 'get').mockReturnValue(true);

			{
				const schema = v.object({
					required: v.literal('alice'),

					unfilled: v.optional(v.string()),
					filled: v.optional(v.string()),

					defaulted: v.optional(v.string(), 'defaulted'),
					defaultedFn: v.optional(v.string(), () => 'defaulted-fn'),
				});

				expect(
					v.parse(schema, {
						required: 'alice',
						filled: 'filled',
						unspecified: 'unspecified',
					}),
				).toEqual({
					required: 'alice',
					filled: 'filled',
					defaulted: 'defaulted',
					defaultedFn: 'defaulted-fn',
					unspecified: 'unspecified',
				});

				expect(
					v.parse(schema, {
						required: 'alice',
						defaulted: 'filled-default',
						defaultedFn: 'filled-default-fn',
					}),
				).toEqual({
					required: 'alice',
					defaulted: 'filled-default',
					defaultedFn: 'filled-default-fn',
				});

				expect(v.is(schema, {})).toBe(false);
				expect(v.is(schema, 123)).toBe(false);

				{
					const result = v.safeParse(schema, { required: 'bob' });

					assert(!result.ok, `expected validation issue`);
					expect(result.message).toBe('invalid_literal at .required (expected "alice")');
					expect(result.issues).toEqual([
						{ code: 'invalid_literal', expected: ['alice'], path: ['required'] },
					]);
				}
			}

			{
				const schema = v.object({
					['__proto__']: v.literal('bob'),
				});

				expect(v.parse(schema, { ['__proto__']: 'bob' })).toEqual({ ['__proto__']: 'bob' });

				expect(v.is(schema, { ['__proto__']: 'alice' })).toBe(false);
			}

			{
				const schema = v.object({
					value: v.integer(),
					get next() {
						return v.optional(schema);
					},
				});

				expect(v.is(schema, { value: 1 })).toBe(true);
				expect(v.is(schema, { value: 1, next: { value: 2 } })).toBe(true);

				v.parse(schema, { value: 1, next: { value: 2, next: { value: 3 } } });
			}

			{
				const addressSchema = v.object({
					street: v.string(),
					city: v.string(),
					zipCode: v.optional(v.string()),
				});

				const personSchema = v.object({
					name: v.string(),
					age: v.integer(),
					address: addressSchema,
					addresses: v.array(addressSchema),
				});

				v.parse(personSchema, {
					name: 'John Doe',
					age: 30,
					address: {
						street: '123 Main St',
						city: 'Anytown',
						zipCode: '12345',
					},
					addresses: [
						{
							street: '456 Oak Ave',
							city: 'Other City',
						},
						{
							street: '789 Pine Rd',
							city: 'Another City',
							zipCode: '67890',
						},
					],
				});
			}
		});

		it(`without eval`, () => {
			using _mock = vi.spyOn(allowsEval, 'value', 'get').mockReturnValue(false);

			{
				const schema = v.object({
					required: v.literal('alice'),

					unfilled: v.optional(v.string()),
					filled: v.optional(v.string()),

					defaulted: v.optional(v.string(), 'defaulted'),
					defaultedFn: v.optional(v.string(), () => 'defaulted-fn'),
				});

				expect(
					v.parse(schema, {
						required: 'alice',
						filled: 'filled',
						unspecified: 'unspecified',
					}),
				).toEqual({
					required: 'alice',
					filled: 'filled',
					defaulted: 'defaulted',
					defaultedFn: 'defaulted-fn',
					unspecified: 'unspecified',
				});

				expect(
					v.parse(schema, {
						required: 'alice',
						defaulted: 'filled-default',
						defaultedFn: 'filled-default-fn',
					}),
				).toEqual({
					required: 'alice',
					defaulted: 'filled-default',
					defaultedFn: 'filled-default-fn',
				});

				expect(v.is(schema, {})).toBe(false);
				expect(v.is(schema, 123)).toBe(false);

				{
					const result = v.safeParse(schema, { required: 'bob' });

					assert(!result.ok, `expected validation issue`);
					expect(result.message).toBe('invalid_literal at .required (expected "alice")');
					expect(result.issues).toEqual([
						{ code: 'invalid_literal', expected: ['alice'], path: ['required'] },
					]);
				}
			}

			{
				const schema = v.object({
					['__proto__']: v.literal('bob'),
				});

				expect(v.parse(schema, { ['__proto__']: 'bob' })).toEqual({ ['__proto__']: 'bob' });

				expect(v.is(schema, { ['__proto__']: 'alice' })).toBe(false);
			}
		});
	});

	describe(`validates record type`, () => {
		it(`with eval`, () => {
			using _mock = vi.spyOn(allowsEval, 'value', 'get').mockReturnValue(true);

			const schema = v.record(
				v.tidString(),
				v.object({
					$type: v.literal('com.example.kitchen'),
					createdAt: v.datetimeString(),
				}),
			);

			expect(v.is(schema, { $type: 'com.example.kitchen', createdAt: new Date().toISOString() })).toBe(true);
		});

		it(`without eval`, () => {
			using _mock = vi.spyOn(allowsEval, 'value', 'get').mockReturnValue(false);

			const schema = v.record(
				v.tidString(),
				v.object({
					$type: v.literal('com.example.kitchen'),
					createdAt: v.datetimeString(),
				}),
			);

			expect(v.is(schema, { $type: 'com.example.kitchen', createdAt: new Date().toISOString() })).toBe(true);
		});
	});

	it(`validates variant type`, () => {
		{
			const schema = v.variant(
				[
					v.object({
						$type: v.literal('label'),
						identifier: v.string(),
						preference: v.literalEnum(['allow', 'hide', 'warn']),
					}),

					v.object({
						$type: v.literal('adultContent'),
						enabled: v.optional(v.boolean(), false),
					}),
				],
				false,
			);

			expect(v.is(schema, { $type: 'label', identifier: 'rude', preference: 'allow' })).toBe(true);
			expect(v.is(schema, { $type: 'adultContent' })).toBe(true);
			expect(v.is(schema, { $type: 'adultContent', enabled: false })).toBe(true);

			expect(v.is(schema, { $type: 'unknown', hello: 'world' })).toBe(true);

			expect(v.is(schema, 123)).toBe(false);
			expect(v.is(schema, {})).toBe(false);
			expect(v.is(schema, { $type: 123 })).toBe(false);
			expect(v.is(schema, { $type: 'adultContent', enabled: 123 })).toBe(false);
		}

		{
			const schema = v.variant(
				[
					v.object({
						$type: v.literal('label'),
						identifier: v.string(),
						preference: v.literalEnum(['allow', 'hide', 'warn']),
					}),

					v.object({
						$type: v.literal('adultContent'),
						enabled: v.optional(v.boolean(), false),
					}),
				],
				true,
			);

			expect(v.is(schema, { $type: 'label', identifier: 'rude', preference: 'allow' })).toBe(true);
			expect(v.is(schema, { $type: 'adultContent' })).toBe(true);
			expect(v.is(schema, { $type: 'adultContent', enabled: false })).toBe(true);

			expect(v.is(schema, { $type: 'unknown', hello: 'world' })).toBe(false);

			expect(v.is(schema, 123)).toBe(false);
			expect(v.is(schema, {})).toBe(false);
			expect(v.is(schema, { $type: 123 })).toBe(false);
			expect(v.is(schema, { $type: 'adultContent', enabled: 123 })).toBe(false);
		}
	});

	it(`validates variant type with record members`, () => {
		const recordSchema = v.record(
			v.tidString(),
			v.object({
				$type: v.literal('com.example.post'),
				text: v.string(),
				createdAt: v.datetimeString(),
			}),
		);

		const objectSchema = v.object({
			$type: v.literal('com.example.like'),
			subject: v.string(),
		});

		{
			const schema = v.variant([recordSchema, objectSchema], false);

			expect(
				v.is(schema, { $type: 'com.example.post', text: 'hello', createdAt: new Date().toISOString() }),
			).toBe(true);
			expect(
				v.is(schema, { $type: 'com.example.like', subject: 'at://did:plc:1234/com.example.post/1' }),
			).toBe(true);

			expect(v.is(schema, { $type: 'unknown', hello: 'world' })).toBe(true);

			expect(v.is(schema, 123)).toBe(false);
			expect(v.is(schema, {})).toBe(false);
			expect(v.is(schema, { $type: 'com.example.post', text: 123 })).toBe(false);
		}

		{
			const schema = v.variant([recordSchema, objectSchema], true);

			expect(
				v.is(schema, { $type: 'com.example.post', text: 'hello', createdAt: new Date().toISOString() }),
			).toBe(true);
			expect(
				v.is(schema, { $type: 'com.example.like', subject: 'at://did:plc:1234/com.example.post/1' }),
			).toBe(true);

			expect(v.is(schema, { $type: 'unknown', hello: 'world' })).toBe(false);

			expect(v.is(schema, { $type: 'com.example.post', text: 123 })).toBe(false);
		}
	});

	it(`validates record referenced directly in an object`, () => {
		const recordSchema = v.record(
			v.tidString(),
			v.object({
				$type: v.literal('com.example.post'),
				text: v.string(),
			}),
		);

		const schema = v.object({
			$type: v.optional(v.literal('com.example.wrapper')),
			post: recordSchema,
		});

		expect(v.is(schema, { post: { $type: 'com.example.post', text: 'hello' } })).toBe(true);
		expect(v.is(schema, { post: { $type: 'com.example.post', text: 123 } })).toBe(false);
		expect(v.is(schema, { post: { text: 'hello' } })).toBe(false);
		expect(v.is(schema, { post: 'not an object' })).toBe(false);
		expect(v.is(schema, {})).toBe(false);
	});
});

describe(`constraints`, () => {
	describe(`integer`, () => {
		it(`constrains integer range`, () => {
			const schema = v.constrain(v.integer(), [v.integerRange(6, 12)]);

			expect(v.is(schema, 9)).toBe(true);

			expect(v.is(schema, 3)).toBe(false);
			expect(v.is(schema, 15)).toBe(false);

			{
				const result = v.safeParse(schema, 15);

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe('invalid_integer_range at . (expected an integer between 6 and 12)');
				expect(result.issues).toEqual([{ code: 'invalid_integer_range', min: 6, max: 12, path: [] }]);
			}
		});
	});

	describe(`string`, () => {
		it(`constrains string UTF-8 length`, () => {
			const schema = v.constrain(v.string(), [v.stringLength(6, 12)]);

			expect(v.is(schema, 'a'.repeat(9)), `length: 9`).toBe(true);

			expect(v.is(schema, 'b'.repeat(3)), `length: 3`).toBe(false);
			expect(v.is(schema, 'c'.repeat(15)), `length: 15`).toBe(false);

			// 'café' = 4 UTF-16 chars, 5 UTF-8 bytes - should pass (5 bytes < 12 max)
			expect(v.is(schema, 'café'), `café: 4 UTF-16, 5 UTF-8`).toBe(false); // 5 bytes < 6 min

			// '𝕳𝖊𝖑𝖑𝖔' = 10 UTF-16 chars, 20 UTF-8 bytes - should fail (20 bytes > 12 max)
			expect(v.is(schema, '𝕳𝖊𝖑𝖑𝖔'), `math bold: 10 UTF-16, 20 UTF-8`).toBe(false);

			// 'नमस्ते' = 6 UTF-16 chars, 18 UTF-8 bytes - should fail (18 bytes > 12 max)
			expect(v.is(schema, 'नमस्ते'), `devanagari: 6 UTF-16, 18 UTF-8`).toBe(false);

			// 'ééé' = 3 UTF-16 chars, 6 UTF-8 bytes - should pass
			expect(v.is(schema, 'ééé'), `accented: 3 UTF-16, 6 UTF-8`).toBe(true);

			{
				const result = v.safeParse(schema, 'c'.repeat(15));

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe(
					'invalid_string_length at . (expected a string between 6 and 12 character(s))',
				);
				expect(result.issues).toEqual([
					{ code: 'invalid_string_length', minLength: 6, maxLength: 12, path: [] },
				]);
			}

			{
				const result = v.safeParse(schema, '𝕳𝖊𝖑𝖑𝖔');

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe(
					'invalid_string_length at . (expected a string between 6 and 12 character(s))',
				);
				expect(result.issues).toEqual([
					{ code: 'invalid_string_length', minLength: 6, maxLength: 12, path: [] },
				]);
			}
		});

		it(`constrains string grapheme length`, () => {
			{
				const schema = v.constrain(v.string(), [v.stringGraphemes(6, 12)]);

				expect(v.is(schema, 'a'.repeat(9)), `length: 9`).toBe(true);

				expect(v.is(schema, 'b'.repeat(3)), `length: 3`).toBe(false);
				expect(v.is(schema, 'c'.repeat(15)), `length: 15`).toBe(false);

				// '👨‍👩‍👧‍👦' = 11 UTF-16 chars, 1 grapheme - should fail (1 grapheme < 6 min)
				expect(v.is(schema, '👨‍👩‍👧‍👦'), `family emoji: 11 UTF-16, 1 grapheme`).toBe(false);

				// '🏳️‍🌈' = 6 UTF-16 chars, 1 grapheme - should fail (1 grapheme < 6 min)
				expect(v.is(schema, '🏳️‍🌈'), `rainbow flag: 6 UTF-16, 1 grapheme`).toBe(false);

				// '🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸' = 28 UTF-16 chars, 7 graphemes - should pass (7 graphemes in 6-12 range)
				expect(v.is(schema, '🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸'), `flag emojis: 28 UTF-16, 7 graphemes`).toBe(true);

				// 'नमस्ते नमस्ते नमस्ते' = 20 UTF-16 chars, 11 graphemes - should pass (11 graphemes in 6-12 range)
				expect(v.is(schema, 'नमस्ते नमस्ते नमस्ते'), `devanagari: 20 UTF-16, 11 graphemes`).toBe(true);

				// 'e\u0301'.repeat(7) = 14 UTF-16 chars, 7 graphemes - should pass (7 graphemes in 6-12 range)
				expect(v.is(schema, 'e\u0301'.repeat(7)), `decomposed accents: 14 UTF-16, 7 graphemes`).toBe(true);

				// '👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦' = 66 UTF-16 chars, 6 graphemes
				expect(v.is(schema, '👨‍👩‍👧‍👦'.repeat(6)), `family emojis: 66 UTF-16, 6 graphemes`).toBe(true);

				{
					const result = v.safeParse(schema, 'c'.repeat(15));

					assert(!result.ok, `expected validation issue`);
					expect(result.message).toBe(
						'invalid_string_graphemes at . (expected a string between 6 and 12 grapheme(s))',
					);
					expect(result.issues).toEqual([
						{ code: 'invalid_string_graphemes', minGraphemes: 6, maxGraphemes: 12, path: [] },
					]);
				}

				{
					const result = v.safeParse(schema, '👨‍👩‍👧‍👦'); // 11 UTF-16 chars, 1 grapheme

					assert(!result.ok, `expected validation issue`);
					expect(result.message).toBe(
						'invalid_string_graphemes at . (expected a string between 6 and 12 grapheme(s))',
					);
					expect(result.issues).toEqual([
						{ code: 'invalid_string_graphemes', minGraphemes: 6, maxGraphemes: 12, path: [] },
					]);
				}

				{
					const result = v.safeParse(schema, '👨‍👩‍👧‍👦'.repeat(15)); // 165 UTF-16 chars, 15 graphemes

					assert(!result.ok, `expected validation issue`);
					expect(result.message).toBe(
						'invalid_string_graphemes at . (expected a string between 6 and 12 grapheme(s))',
					);
					expect(result.issues).toEqual([
						{ code: 'invalid_string_graphemes', minGraphemes: 6, maxGraphemes: 12, path: [] },
					]);
				}
			}

			{
				const schema = v.constrain(v.string(), [v.stringGraphemes(0, 15)]);

				expect(v.is(schema, '👨‍👩‍👧‍👦'), `family emoji: 11 UTF-16 <= 15 max, 1 grapheme`).toBe(true);
				expect(v.is(schema, '🏳️‍🌈'), `rainbow flag: 6 UTF-16 <= 15 max, 1 grapheme`).toBe(true);
				expect(v.is(schema, 'a'.repeat(15)), `15 ASCII chars: 15 UTF-16 <= 15 max`).toBe(true);
			}
		});
	});

	describe(`bytes`, () => {
		it(`constrains byte size`, () => {
			const testCases = [
				{ base64: '', expectedSize: 0 }, // ""
				{ base64: 'YQ==', expectedSize: 1 }, // "a"
				{ base64: 'YWI=', expectedSize: 2 }, // "ab"
				{ base64: 'YWJj', expectedSize: 3 }, // "abc"
				{ base64: 'YWJjZA==', expectedSize: 4 }, // "abcd"
				{ base64: 'aGVsbG8=', expectedSize: 5 }, // "hello"
				{ base64: 'MTIzNDU2', expectedSize: 6 }, // "123456"
				{ base64: 'dGVzdGluZw==', expectedSize: 7 }, // "testing"
				{ base64: 'MTIzNDU2Nzg=', expectedSize: 8 }, // "12345678"
				{ base64: 'dGVzdGluZzE=', expectedSize: 8 }, // "testing1"
				{ base64: 'dGVzdGluZzEy', expectedSize: 9 }, // "testing12"
				{ base64: 'dGVzdGluZzEyMw==', expectedSize: 10 }, // "testing123"
				{ base64: 'aGVsbG8gd29ybGQ=', expectedSize: 11 }, // "hello world"
				{ base64: 'dGhpcyBpcyBhIGxvbmcgc3RyaW5n', expectedSize: 21 }, // "this is a long string"
			];

			for (const { base64, expectedSize } of testCases) {
				const exact = v.constrain(v.bytes(), [v.bytesSize(expectedSize, expectedSize)]);

				const json = { $bytes: base64 };
				const lex = toBytes(fromBase64(base64));

				expect(v.is(exact, json), `${base64} == ${expectedSize}`).toBe(true);
				expect(v.is(exact, lex), `${base64} == ${expectedSize}`).toBe(true);

				// test that one size different fails
				if (expectedSize > 0) {
					const plus = v.constrain(v.bytes(), [v.bytesSize(expectedSize + 1, expectedSize + 1)]);
					expect(v.is(plus, json), `${base64} != ${expectedSize + 1}`).toBe(false);
					expect(v.is(plus, lex), `${base64} != ${expectedSize + 1}`).toBe(false);

					const minus = v.constrain(v.bytes(), [v.bytesSize(expectedSize - 1, expectedSize - 1)]);
					expect(v.is(minus, json), `${base64} != ${expectedSize - 1}`).toBe(false);
					expect(v.is(minus, lex), `${base64} != ${expectedSize + 1}`).toBe(false);
				}
			}

			// test error messages
			{
				const schema = v.constrain(v.bytes(), [v.bytesSize(6, 12)]);
				const result = v.safeParse(schema, { $bytes: 'YQ==' }); // "a" = 1 byte

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe(
					'invalid_bytes_size at . (expected a byte array between 6 and 12 byte(s))',
				);
				expect(result.issues).toEqual([{ code: 'invalid_bytes_size', minSize: 6, maxSize: 12, path: [] }]);
			}

			{
				const schema = v.constrain(v.bytes(), [v.bytesSize(6, 12)]);
				const result = v.safeParse(schema, { $bytes: 'dGhpcyBpcyBhIGxvbmcgc3RyaW5n' }); // 21 bytes

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe(
					'invalid_bytes_size at . (expected a byte array between 6 and 12 byte(s))',
				);
				expect(result.issues).toEqual([{ code: 'invalid_bytes_size', minSize: 6, maxSize: 12, path: [] }]);
			}
		});
	});

	describe(`array`, () => {
		it(`constrains array length`, () => {
			const schema = v.constrain(v.array(v.string()), [v.arrayLength(2, 3)]);

			expect(v.is(schema, ['alice', 'bob', 'mallory'])).toBe(true);

			expect(v.is(schema, ['alice'])).toBe(false);
			expect(v.is(schema, ['alice', 'bob', 'mallory', 'frank'])).toBe(false);

			{
				const result = v.safeParse(schema, ['alice', 'bob', 'mallory', 'frank']);

				assert(!result.ok, `expected validation issue`);
				expect(result.message).toBe('invalid_array_length at . (expected an array between 2 and 3 item(s))');
				expect(result.issues).toEqual([
					{ code: 'invalid_array_length', maxLength: 3, minLength: 2, path: [] },
				]);
			}
		});
	});
});

describe(`string format types`, () => {
	it(`validates actorIdentifierString`, () => {
		const schema = v.actorIdentifierString();

		expect(v.is(schema, 'alice.bsky.social')).toBe(true);
		expect(v.is(schema, 'did:web:example.com')).toBe(true);
		expect(v.is(schema, 'invalid-identifier')).toBe(false);

		expect(v.is(schema, null)).toBe(false);

		{
			const result = v.safeParse(schema, 'invalid');

			assert(!result.ok, `expected validation issue`);
			expect(result.message).toBe('invalid_string_format at . (expected a at-identifier formatted string)');
			expect(result.issues).toEqual([{ code: 'invalid_string_format', expected: 'at-identifier', path: [] }]);
		}
	});

	it(`validates resourceUriString`, () => {
		const schema = v.resourceUriString();

		expect(v.is(schema, 'at://did:plc:asdf123/com.atproto.feed.post/record')).toBe(true);
		expect(v.is(schema, 'at://user.bsky.social')).toBe(true);

		expect(v.is(schema, 'invalid-uri')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates cidString`, () => {
		const schema = v.cidString();

		expect(v.is(schema, 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a')).toBe(true);

		expect(v.is(schema, 'invalid-cid')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates datetimeString`, () => {
		const schema = v.datetimeString();

		expect(v.is(schema, '1985-04-12T23:20:50.123Z')).toBe(true);
		expect(v.is(schema, '2000-01-01T00:00:00.000Z')).toBe(true);

		expect(v.is(schema, 'invalid-datetime')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates didString`, () => {
		const schema = v.didString();

		expect(v.is(schema, 'did:web:example.com')).toBe(true);
		expect(v.is(schema, 'did:plc:7iza6de2dwap2sbkpav7c6c6')).toBe(true);

		expect(v.is(schema, 'invalid-did')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates handleString`, () => {
		const schema = v.handleString();

		expect(v.is(schema, 'alice.bsky.social')).toBe(true);
		expect(v.is(schema, 'john.test')).toBe(true);

		expect(v.is(schema, 'invalid-handle')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates languageCodeString`, () => {
		const schema = v.languageCodeString();

		expect(v.is(schema, 'en')).toBe(true);
		expect(v.is(schema, 'en-GB')).toBe(true);
		expect(v.is(schema, 'pt-BR')).toBe(true);

		expect(v.is(schema, 'j')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates nsidString`, () => {
		const schema = v.nsidString();

		expect(v.is(schema, 'com.example.fooBar')).toBe(true);
		expect(v.is(schema, 'net.users.bob.ping')).toBe(true);

		expect(v.is(schema, 'invalid-nsid')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates recordKeyString`, () => {
		const schema = v.recordKeyString();

		expect(v.is(schema, 'self')).toBe(true);
		expect(v.is(schema, 'example.com')).toBe(true);
		expect(v.is(schema, 'literal:self')).toBe(true);

		expect(v.is(schema, 'invalid/key')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates tidString`, () => {
		const schema = v.tidString();

		expect(v.is(schema, '3jzfcijpj2z2a')).toBe(true);
		expect(v.is(schema, '7777777777777')).toBe(true);

		expect(v.is(schema, 'invalid-tid')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});

	it(`validates genericUriString`, () => {
		const schema = v.genericUriString();

		expect(v.is(schema, 'https://example.com')).toBe(true);
		expect(v.is(schema, 'dns:example.com')).toBe(true);
		expect(v.is(schema, 'at://handle.example.com/nsid/rkey')).toBe(true);

		expect(v.is(schema, 'invalid-uri')).toBe(false);

		expect(v.is(schema, null)).toBe(false);
	});
});
