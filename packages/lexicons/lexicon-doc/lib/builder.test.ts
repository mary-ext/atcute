import { describe, expect, test } from 'vitest';

import {
	array,
	blob,
	boolean,
	build,
	bytes,
	document,
	integer,
	nullable,
	object,
	procedure,
	query,
	record,
	required,
	string,
	subscription,
	token,
	unknown,
} from './builder.js';

describe('builder', () => {
	describe('boolean', () => {
		test('can be referenced', () => {
			const showInteractionCount = boolean();

			const docs = build({
				documents: [
					document({
						id: 'com.example.pref',
						defs: {
							main: object({
								properties: {
									showInteractionCount,
								},
							}),

							showInteractionCount,
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.pref': {
					lexicon: 1,
					id: 'com.example.pref',
					defs: {
						main: {
							type: 'object',
							properties: {
								showInteractionCount: { type: 'ref', ref: '#showInteractionCount' },
							},
						},
						showInteractionCount: {
							type: 'boolean',
						},
					},
				},
			});
		});

		test('throws when default does not match const', () => {
			expect(() => boolean({ const: true, default: false })).toThrow(
				'boolean: default value must match const value',
			);
		});

		test('allows valid default with const', () => {
			expect(() => boolean({ const: true, default: true })).not.toThrow();
		});
	});

	describe('integer', () => {
		test('can be referenced', () => {
			const channel = integer({ minimum: 0, maximum: 255 });

			const docs = build({
				documents: [
					document({
						id: 'com.example.color-channel',
						defs: {
							main: channel,
						},
					}),
					document({
						id: 'com.example.color',
						defs: {
							rgb: object({
								properties: {
									r: required(channel),
									g: required(channel),
									b: required(channel),
								},
							}),
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.color-channel': {
					id: 'com.example.color-channel',
					lexicon: 1,
					defs: {
						main: { type: 'integer', maximum: 255, minimum: 0 },
					},
				},
				'com.example.color': {
					lexicon: 1,
					id: 'com.example.color',
					defs: {
						rgb: {
							type: 'object',
							required: ['r', 'g', 'b'],
							properties: {
								b: { type: 'ref', ref: 'com.example.color-channel' },
								g: { type: 'ref', ref: 'com.example.color-channel' },
								r: { type: 'ref', ref: 'com.example.color-channel' },
							},
						},
					},
				},
			});
		});

		test('can be inlined', () => {
			const channel = integer({ minimum: 0, maximum: 255 });

			const docs = build({
				documents: [
					document({
						id: 'com.example.color',
						defs: {
							rgb: object({
								properties: {
									r: required(channel),
									g: required(channel),
									b: required(channel),
								},
							}),
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.color': {
					lexicon: 1,
					id: 'com.example.color',
					defs: {
						rgb: {
							type: 'object',
							required: ['r', 'g', 'b'],
							properties: {
								b: { type: 'integer', maximum: 255, minimum: 0 },
								g: { type: 'integer', maximum: 255, minimum: 0 },
								r: { type: 'integer', maximum: 255, minimum: 0 },
							},
						},
					},
				},
			});
		});

		test('throws when minimum > maximum', () => {
			expect(() => integer({ minimum: 10, maximum: 5 })).toThrow(
				"integer: minimum value (10) can't be greater than maximum value (5)",
			);
		});

		test('throws when default does not match const', () => {
			expect(() => integer({ const: 5, default: 10 })).toThrow(
				'integer: default value must match const value',
			);
		});

		test('throws when default < minimum', () => {
			expect(() => integer({ minimum: 10, default: 5 })).toThrow(
				"integer: default value (5) can't be lower than minimum value (10)",
			);
		});

		test('throws when default > maximum', () => {
			expect(() => integer({ maximum: 10, default: 15 })).toThrow(
				"integer: default value (15) can't be greater than maximum value (10)",
			);
		});

		test('throws when const and enum are both present', () => {
			expect(() => integer({ const: 5, enum: [1, 2, 3] })).toThrow(
				"integer: const and enum can't be used together",
			);
		});

		test('throws when enum value < minimum', () => {
			expect(() => integer({ minimum: 10, enum: [5, 15, 20] })).toThrow(
				"integer: enum[0] (5) can't be lower than minimum value (10)",
			);
		});

		test('throws when enum value > maximum', () => {
			expect(() => integer({ maximum: 10, enum: [5, 15, 20] })).toThrow(
				"integer: enum[1] (15) can't be greater than maximum value (10)",
			);
		});

		test('throws when default value is not in enum', () => {
			expect(() => integer({ enum: [10, 20, 30], default: 15 })).toThrow(
				'integer: default value must be one of the enum values',
			);
		});

		test('allows valid enum', () => {
			expect(() => integer({ minimum: 0, maximum: 100, enum: [10, 20, 30] })).not.toThrow();
		});

		test('allows default value that is in enum', () => {
			expect(() => integer({ enum: [10, 20, 30], default: 20 })).not.toThrow();
		});
	});

	describe('string', () => {
		test('can reference tokens as a known value', () => {
			const black = token();
			const white = token();
			const red = token();
			const green = token();
			const blue = token();

			const docs = build({
				documents: [
					document({
						id: 'com.example.color',
						defs: {
							main: string({
								default: black,
								knownValues: [black, white, red, green, blue],
							}),
							black,
							white,
							red,
							green,
							blue,
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.color': {
					lexicon: 1,
					id: 'com.example.color',
					defs: {
						main: {
							type: 'string',
							default: 'com.example.color#black',
							knownValues: [
								'com.example.color#black',
								'com.example.color#white',
								'com.example.color#red',
								'com.example.color#green',
								'com.example.color#blue',
							],
						},
						black: {
							type: 'token',
						},
						white: {
							type: 'token',
						},
						red: {
							type: 'token',
						},
						green: {
							type: 'token',
						},
						blue: {
							type: 'token',
						},
					},
				},
			});
		});

		test('throws when minLength > maxLength', () => {
			expect(() => string({ minLength: 10, maxLength: 5 })).toThrow(
				"string: minimum length (10) can't be greater than maximum length (5)",
			);
		});

		test('throws when minGraphemes > maxGraphemes', () => {
			expect(() => string({ minGraphemes: 10, maxGraphemes: 5 })).toThrow(
				"string: minimum graphemes (10) can't be greater than maximum graphemes (5)",
			);
		});

		test('throws when default does not match const', () => {
			expect(() => string({ const: 'foo', default: 'bar' })).toThrow(
				'string: default value must match const value',
			);
		});

		test('throws when default is shorter than minLength', () => {
			expect(() => string({ minLength: 10, default: 'hi' })).toThrow(
				'string: default value ("hi") can\'t be shorter than minimum length (10)',
			);
		});

		test('throws when default is longer than maxLength', () => {
			expect(() => string({ maxLength: 5, default: 'hello world' })).toThrow(
				'string: default value ("hello world") can\'t be longer than maximum length (5)',
			);
		});

		test('throws when const and enum are both present', () => {
			expect(() => string({ const: 'foo', enum: ['bar', 'baz'] })).toThrow(
				"string: const and enum can't be used together",
			);
		});

		test('throws when enum value is shorter than minLength', () => {
			expect(() => string({ minLength: 5, enum: ['hi', 'hello', 'world'] })).toThrow(
				'string: enum[0] ("hi") can\'t be shorter than minimum length (5)',
			);
		});

		test('throws when enum value is longer than maxLength', () => {
			expect(() => string({ maxLength: 5, enum: ['hi', 'hello', 'worlds'] })).toThrow(
				'string: enum[2] ("worlds") can\'t be longer than maximum length (5)',
			);
		});

		test('throws when knownValues value is shorter than minLength', () => {
			expect(() => string({ minLength: 5, knownValues: ['hi', 'hello', 'world'] })).toThrow(
				'string: knownValues[0] ("hi") can\'t be shorter than minimum length (5)',
			);
		});

		test('throws when default value is not in enum', () => {
			expect(() => string({ enum: ['foo', 'bar', 'baz'], default: 'qux' })).toThrow(
				'string: default value must be one of the enum values',
			);
		});

		test('allows valid enum', () => {
			expect(() => string({ minLength: 2, maxLength: 10, enum: ['foo', 'bar', 'baz'] })).not.toThrow();
		});

		test('allows default value that is in enum', () => {
			expect(() => string({ enum: ['foo', 'bar', 'baz'], default: 'bar' })).not.toThrow();
		});

		test('allows valid knownValues', () => {
			expect(() => string({ minLength: 2, maxLength: 10, knownValues: ['foo', 'bar', 'baz'] })).not.toThrow();
		});
	});

	describe('unknown', () => {
		test('can be inlined', () => {
			const docs = build({
				documents: [
					document({
						id: 'com.example.doc',
						defs: {
							main: object({
								properties: {
									value: unknown(),
								},
							}),
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.doc': {
					lexicon: 1,
					id: 'com.example.doc',
					defs: {
						main: {
							type: 'object',
							properties: {
								value: { type: 'unknown' },
							},
						},
					},
				},
			});
		});

		test('can be referenced', () => {
			const raw = unknown();

			const docs = build({
				documents: [
					document({
						id: 'com.example.doc',
						defs: {
							main: object({
								properties: {
									value: raw,
								},
							}),
							raw: raw,
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.doc': {
					lexicon: 1,
					id: 'com.example.doc',
					defs: {
						main: {
							type: 'object',
							properties: {
								value: { type: 'ref', ref: '#raw' },
							},
						},
						raw: {
							type: 'unknown',
						},
					},
				},
			});
		});
	});

	describe('bytes', () => {
		test('throws when minLength > maxLength', () => {
			expect(() => bytes({ minLength: 10, maxLength: 5 })).toThrow(
				"bytes: minimum length (10) can't be greater than maximum length (5)",
			);
		});

		test('allows valid bounds', () => {
			expect(() => bytes({ minLength: 0, maxLength: 100 })).not.toThrow();
		});
	});

	describe('cid-link', () => {
		test('can be inlined', () => {});
	});

	describe('ref', () => {
		test('can be inlined', () => {});
	});

	describe('union', () => {
		test('can be inlined', () => {});
	});

	describe('blob', () => {
		test('can be inlined', () => {
			const docs = build({
				documents: [
					document({
						id: 'com.example.doc',
						defs: {
							main: object({
								properties: {
									image: blob(),
								},
							}),
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.doc': {
					lexicon: 1,
					id: 'com.example.doc',
					defs: {
						main: {
							type: 'object',
							properties: {
								image: { type: 'blob' },
							},
						},
					},
				},
			});
		});

		test('can be referenced', () => {
			const header = blob({ maxSize: 5 * 1024 * 1024 });

			const docs = build({
				documents: [
					document({
						id: 'com.example.doc',
						defs: {
							main: object({
								properties: {
									header: header,
								},
							}),
							header: header,
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.doc': {
					lexicon: 1,
					id: 'com.example.doc',
					defs: {
						main: {
							type: 'object',
							properties: {
								header: { type: 'ref', ref: '#header' },
							},
						},
						header: {
							type: 'blob',
							maxSize: 5 * 1024 * 1024,
						},
					},
				},
			});
		});
	});

	describe('array', () => {
		test('throws when minLength > maxLength', () => {
			expect(() => array({ items: string(), minLength: 10, maxLength: 5 })).toThrow(
				"array: minimum length (10) can't be greater than maximum length (5)",
			);
		});

		test('allows valid bounds', () => {
			expect(() => array({ items: string(), minLength: 0, maxLength: 100 })).not.toThrow();
		});
	});

	describe('token', () => {
		test('can be referenced', () => {});
	});

	describe('object', () => {
		test('allows declaring optional, required, and nullable fields', () => {
			const docs = build({
				documents: [
					document({
						id: 'com.example.sample',
						defs: {
							main: object({
								properties: {
									optional: string(),
									required: required(string()),
									nullable: nullable(string()),
									requiredNullable: required(nullable(string())),
									nullableRequired: nullable(required(string())),
								},
							}),
						},
					}),
				],
			});

			expect(docs).toEqual({
				'com.example.sample': {
					lexicon: 1,
					id: 'com.example.sample',
					defs: {
						main: {
							type: 'object',
							required: ['required', 'requiredNullable', 'nullableRequired'],
							nullable: ['nullable', 'requiredNullable', 'nullableRequired'],
							properties: {
								optional: { type: 'string' },
								required: { type: 'string' },
								nullable: { type: 'string' },
								requiredNullable: { type: 'string' },
								nullableRequired: { type: 'string' },
							},
						},
					},
				},
			});
		});
	});

	describe('params', () => {
		test('can be inlined', () => {});
	});

	describe('query', () => {
		test('can be defined', () => {});
	});

	describe('procedure', () => {
		test('can be defined', () => {});
	});

	describe('subscription', () => {
		test('can be defined', () => {});
	});

	describe('document', () => {
		test('allows extra named definitions for supported types', () => {
			expect(() =>
				document({
					id: 'com.example.valid',
					defs: {
						main: record({ record: object() }),
						profile: object(),
						tokenRef: token(),
					},
				}),
			).not.toThrow();
		});

		test(`throws when record is defined outside main`, () => {
			expect(() => {
				return document({
					id: 'com.example.invalid',
					defs: {
						other: record({ record: object() }),
					},
				});
			}).toThrow('com.example.invalid#other: record must be the main definition');
		});

		test(`throws when query is defined outside main`, () => {
			expect(() => {
				return document({
					id: 'com.example.invalid',
					defs: {
						other: query(),
					},
				});
			}).toThrow('com.example.invalid#other: query must be the main definition');
		});

		test(`throws when procedure is defined outside main`, () => {
			expect(() => {
				return document({
					id: 'com.example.invalid',
					defs: {
						other: procedure(),
					},
				});
			}).toThrow('com.example.invalid#other: procedure must be the main definition');
		});

		test(`throws when subscription is defined outside main`, () => {
			expect(() => {
				return document({
					id: 'com.example.invalid',
					defs: {
						other: subscription(),
					},
				});
			}).toThrow('com.example.invalid#other: subscription must be the main definition');
		});
	});
});
