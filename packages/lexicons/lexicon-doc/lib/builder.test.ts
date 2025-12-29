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
	permissionSet,
	procedure,
	query,
	record,
	repoPermission,
	required,
	rpcPermission,
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
				'boolean/default: value must match const value',
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
				"integer/minimum: value (10) can't be greater than maximum value (5)",
			);
		});

		test('throws when default does not match const', () => {
			expect(() => integer({ const: 5, default: 10 })).toThrow(
				'integer/default: value must match const value',
			);
		});

		test('throws when default < minimum', () => {
			expect(() => integer({ minimum: 10, default: 5 })).toThrow(
				"integer/default: value (5) can't be lower than minimum value (10)",
			);
		});

		test('throws when default > maximum', () => {
			expect(() => integer({ maximum: 10, default: 15 })).toThrow(
				"integer/default: value (15) can't be greater than maximum value (10)",
			);
		});

		test('throws when const and enum are both present', () => {
			expect(() => integer({ const: 5, enum: [1, 2, 3] })).toThrow(
				"integer/const: const and enum can't be used together",
			);
		});

		test('throws when enum value < minimum', () => {
			expect(() => integer({ minimum: 10, enum: [5, 15, 20] })).toThrow(
				"integer/enum[0]: value (5) can't be lower than minimum value (10)",
			);
		});

		test('throws when enum value > maximum', () => {
			expect(() => integer({ maximum: 10, enum: [5, 15, 20] })).toThrow(
				"integer/enum[1]: value (15) can't be greater than maximum value (10)",
			);
		});

		test('throws when default value is not in enum', () => {
			expect(() => integer({ enum: [10, 20, 30], default: 15 })).toThrow(
				'integer/default: value must be one of the enum values',
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

		test('throws when token const value violates minLength during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									const: myToken,
									minLength: 1000, // resolved token URI will be much shorter
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/const:.*can't be shorter than minimum length/);
		});

		test('throws when token default value violates maxLength during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									default: myToken,
									maxLength: 5, // resolved token URI will be much longer
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/default:.*can't be longer than maximum length/);
		});

		test('throws when token enum value violates minLength during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									enum: [myToken],
									minLength: 1000,
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/enum\/0:.*can't be shorter than minimum length/);
		});

		test('throws when token knownValues violates maxLength during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									knownValues: [myToken],
									maxLength: 5,
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/knownValues\/0:.*can't be longer than maximum length/);
		});

		test('throws when token const value does not match format during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									const: myToken,
									format: 'did', // resolved token URI won't match did format
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/const:.*does not match format 'did'/);
		});

		test('allows token const value that matches format during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.tokenDef',
							defs: {
								main: myToken, // resolves to just 'com.example.tokenDef' without fragment
							},
						}),
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									const: myToken,
									format: 'nsid', // resolved token URI is valid nsid
								}),
							},
						}),
					],
				}),
			).not.toThrow();
		});

		test('throws when token default value does not match format during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									default: myToken,
									format: 'handle', // resolved token URI won't match handle format
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/default:.*does not match format 'handle'/);
		});

		test('throws when token enum value does not match format during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									enum: [myToken],
									format: 'cid', // resolved token URI won't match cid format
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/enum\/0:.*does not match format 'cid'/);
		});

		test('throws when token knownValue does not match format during build', () => {
			const myToken = token();

			expect(() =>
				build({
					documents: [
						document({
							id: 'com.example.test',
							defs: {
								main: string({
									knownValues: [myToken],
									format: 'datetime', // resolved token URI won't match datetime format
								}),
								myToken,
							},
						}),
					],
				}),
			).toThrow(/com\.example\.test#main\/knownValues\/0:.*does not match format 'datetime'/);
		});

		test('throws when minLength > maxLength', () => {
			expect(() => string({ minLength: 10, maxLength: 5 })).toThrow(
				"string/minLength: value (10) can't be greater than maximum length (5)",
			);
		});

		test('throws when minGraphemes > maxGraphemes', () => {
			expect(() => string({ minGraphemes: 10, maxGraphemes: 5 })).toThrow(
				"string/minGraphemes: value (10) can't be greater than maximum graphemes (5)",
			);
		});

		test('throws when default does not match const', () => {
			expect(() => string({ const: 'foo', default: 'bar' })).toThrow(
				'string/default: value must match const value',
			);
		});

		test('throws when default is shorter than minLength', () => {
			expect(() => string({ minLength: 10, default: 'hi' })).toThrow(
				'string/default: value ("hi") can\'t be shorter than minimum length (10)',
			);
		});

		test('throws when default is longer than maxLength', () => {
			expect(() => string({ maxLength: 5, default: 'hello world' })).toThrow(
				'string/default: value ("hello world") can\'t be longer than maximum length (5)',
			);
		});

		test('throws when const and enum are both present', () => {
			expect(() => string({ const: 'foo', enum: ['bar', 'baz'] })).toThrow(
				"string/const: const and enum can't be used together",
			);
		});

		test('throws when const and knownValues are both present', () => {
			expect(() => string({ const: 'foo', knownValues: ['bar', 'baz'] })).toThrow(
				"string/const: const and knownValues can't be used together",
			);
		});

		test('throws when enum and knownValues are both present', () => {
			expect(() => string({ enum: ['foo', 'bar'], knownValues: ['baz', 'qux'] })).toThrow(
				"string/enum: enum and knownValues can't be used together",
			);
		});

		test('throws when const, enum, and knownValues are all present', () => {
			expect(() => string({ const: 'foo', enum: ['bar'], knownValues: ['baz'] })).toThrow(
				"string/const: const and enum can't be used together",
			);
		});

		test('throws when default does not match format', () => {
			expect(() => string({ format: 'did', default: 'not-a-did' })).toThrow(
				'string/default: value ("not-a-did") does not match format \'did\'',
			);
		});

		test('allows default that matches format', () => {
			expect(() => string({ format: 'did', default: 'did:plc:7iza6de2dwap2sbkpav7c6c6' })).not.toThrow();
		});

		test('throws when const does not match format', () => {
			expect(() => string({ format: 'nsid', const: 'not a valid nsid' })).toThrow(
				'string/const: value ("not a valid nsid") does not match format \'nsid\'',
			);
		});

		test('allows const that matches format', () => {
			expect(() => string({ format: 'nsid', const: 'com.example.foo' })).not.toThrow();
		});

		test('throws when enum value does not match format', () => {
			expect(() => string({ format: 'handle', enum: ['alice.bsky.social', 'invalid handle!'] })).toThrow(
				'string/enum[1]: value ("invalid handle!") does not match format \'handle\'',
			);
		});

		test('allows enum values that match format', () => {
			expect(() =>
				string({ format: 'handle', enum: ['alice.bsky.social', 'bob.bsky.social'] }),
			).not.toThrow();
		});

		test('throws when knownValue does not match format', () => {
			expect(() => string({ format: 'uri', knownValues: ['https://example.com', 'not a uri'] })).toThrow(
				'string/knownValues[1]: value ("not a uri") does not match format \'uri\'',
			);
		});

		test('allows knownValues that match format', () => {
			expect(() =>
				string({ format: 'uri', knownValues: ['https://example.com', 'dns:example.org'] }),
			).not.toThrow();
		});

		test('throws when enum value is shorter than minLength', () => {
			expect(() => string({ minLength: 5, enum: ['hi', 'hello', 'world'] })).toThrow(
				'string/enum[0]: value ("hi") can\'t be shorter than minimum length (5)',
			);
		});

		test('throws when enum value is longer than maxLength', () => {
			expect(() => string({ maxLength: 5, enum: ['hi', 'hello', 'worlds'] })).toThrow(
				'string/enum[2]: value ("worlds") can\'t be longer than maximum length (5)',
			);
		});

		test('throws when knownValues value is shorter than minLength', () => {
			expect(() => string({ minLength: 5, knownValues: ['hi', 'hello', 'world'] })).toThrow(
				'string/knownValues[0]: value ("hi") can\'t be shorter than minimum length (5)',
			);
		});

		test('throws when default value is not in enum', () => {
			expect(() => string({ enum: ['foo', 'bar', 'baz'], default: 'qux' })).toThrow(
				'string/default: value must be one of the enum values',
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
				"bytes/minLength: value (10) can't be greater than maximum length (5)",
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
				"array/minLength: value (10) can't be greater than maximum length (5)",
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

		test(`throws when permission-set is defined outside main`, () => {
			expect(() => {
				return document({
					id: 'com.example.invalid',
					defs: {
						other: permissionSet({
							permissions: [repoPermission({ collection: ['com.example.foo'] })],
						}),
					},
				});
			}).toThrow('com.example.invalid#other: permission-set must be the main definition');
		});
	});

	describe('permissions', () => {
		describe('repoPermission', () => {
			test('accepts array of collections', () => {
				expect(() => repoPermission({ collection: ['com.example.foo', 'com.example.bar'] })).not.toThrow();
			});

			test('accepts actions as array', () => {
				expect(() => repoPermission({ collection: ['com.example.foo'], action: ['create'] })).not.toThrow();
				expect(() =>
					repoPermission({ collection: ['com.example.foo'], action: ['create', 'update'] }),
				).not.toThrow();
			});

			test('throws on empty array', () => {
				expect(() => repoPermission({ collection: [] })).toThrow(
					"repo-permission/collection: value can't be empty",
				);
			});
		});

		describe('rpcPermission', () => {
			test('accepts array of lxm with wildcard aud', () => {
				expect(() =>
					rpcPermission({
						lxm: ['com.example.method1', 'com.example.method2'],
						aud: '*',
					}),
				).not.toThrow();
			});

			test('accepts single lxm with wildcard aud', () => {
				expect(() => rpcPermission({ lxm: ['com.example.method'], aud: '*' })).not.toThrow();
			});

			test('accepts lxm with inherit aud', () => {
				expect(() => rpcPermission({ lxm: ['com.example.method'], aud: 'inherit' })).not.toThrow();
			});

			test('throws on empty lxm array', () => {
				expect(() => rpcPermission({ lxm: [], aud: '*' })).toThrow(
					"rpc-permission/lxm: value can't be empty",
				);
			});
		});

		describe('permissionSet', () => {
			test('accepts permissions array', () => {
				expect(() =>
					permissionSet({
						permissions: [repoPermission({ collection: ['com.example.foo'] })],
					}),
				).not.toThrow();
			});

			test('accepts optional fields', () => {
				expect(() =>
					permissionSet({
						description: 'test scope',
						title: 'Test',
						detail: 'Test detail',
						permissions: [repoPermission({ collection: ['com.example.foo'] })],
					}),
				).not.toThrow();
			});

			test('throws on empty permissions array', () => {
				expect(() => permissionSet({ permissions: [] })).toThrow(
					"permission-set/permissions: array can't be empty",
				);
			});
		});

		describe('building permissions', () => {
			test('builds repo permission', () => {
				const docs = build({
					documents: [
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									permissions: [
										repoPermission({ collection: ['com.example.foo'], action: ['create'] }),
										repoPermission({ collection: ['com.example.bar', 'com.example.baz'] }),
									],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					permissions: [
						{
							type: 'permission',
							resource: 'repo',
							collection: ['com.example.foo'],
							action: ['create'],
						},
						{
							type: 'permission',
							resource: 'repo',
							collection: ['com.example.bar', 'com.example.baz'],
						},
					],
				});
			});

			test('builds rpc permission', () => {
				const docs = build({
					documents: [
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									permissions: [rpcPermission({ lxm: ['com.example.method'], aud: '*' })],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					permissions: [
						{
							type: 'permission',
							resource: 'rpc',
							lxm: ['com.example.method'],
							aud: '*',
						},
					],
				});
			});

			test('builds permission-set with all fields', () => {
				const docs = build({
					documents: [
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									description: 'test scope',
									title: 'Test Scope',
									'title:lang': { en: 'Test Scope', 'pt-BR': 'Escopo de Teste' },
									detail: 'This is a test scope',
									'detail:lang': { en: 'This is a test scope', 'pt-BR': 'Este é um escopo de teste' },
									permissions: [
										repoPermission({ collection: ['com.example.foo'] }),
										rpcPermission({ lxm: ['com.example.bar'], aud: '*' }),
									],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					description: 'test scope',
					title: 'Test Scope',
					'title:lang': { en: 'Test Scope', 'pt-BR': 'Escopo de Teste' },
					detail: 'This is a test scope',
					'detail:lang': { en: 'This is a test scope', 'pt-BR': 'Este é um escopo de teste' },
					permissions: [
						{
							type: 'permission',
							resource: 'repo',
							collection: ['com.example.foo'],
						},
						{
							type: 'permission',
							resource: 'rpc',
							lxm: ['com.example.bar'],
							aud: '*',
						},
					],
				});
			});

			test('builds repo permission with LexRecordBuilder reference', () => {
				const postRecord = record({ record: object() });

				const docs = build({
					documents: [
						document({
							id: 'com.example.post',
							defs: {
								main: postRecord,
							},
						}),
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									permissions: [repoPermission({ collection: [postRecord], action: ['create'] })],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					permissions: [
						{
							type: 'permission',
							resource: 'repo',
							collection: ['com.example.post'],
							action: ['create'],
						},
					],
				});
			});

			test('builds repo permission with mixed nsid and LexRecordBuilder', () => {
				const postRecord = record({ record: object() });
				const commentRecord = record({ record: object() });

				const docs = build({
					documents: [
						document({
							id: 'com.example.post',
							defs: {
								main: postRecord,
							},
						}),
						document({
							id: 'com.example.comment',
							defs: {
								main: commentRecord,
							},
						}),
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									permissions: [
										repoPermission({
											collection: ['com.example.like', postRecord, commentRecord],
										}),
									],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					permissions: [
						{
							type: 'permission',
							resource: 'repo',
							collection: ['com.example.like', 'com.example.post', 'com.example.comment'],
						},
					],
				});
			});

			test('builds rpc permission with LexXrpcQueryBuilder reference', () => {
				const getMethod = query();

				const docs = build({
					documents: [
						document({
							id: 'com.example.getPost',
							defs: {
								main: getMethod,
							},
						}),
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									permissions: [rpcPermission({ lxm: [getMethod], aud: '*' })],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					permissions: [
						{
							type: 'permission',
							resource: 'rpc',
							lxm: ['com.example.getPost'],
							aud: '*',
						},
					],
				});
			});

			test('builds rpc permission with mixed XRPC builders', () => {
				const getMethod = query();
				const postMethod = procedure();
				const subMethod = subscription();

				const docs = build({
					documents: [
						document({
							id: 'com.example.getPost',
							defs: {
								main: getMethod,
							},
						}),
						document({
							id: 'com.example.createPost',
							defs: {
								main: postMethod,
							},
						}),
						document({
							id: 'com.example.subscribePosts',
							defs: {
								main: subMethod,
							},
						}),
						document({
							id: 'com.example.scope',
							defs: {
								main: permissionSet({
									permissions: [
										rpcPermission({
											lxm: [getMethod, 'com.example.updatePost', postMethod, subMethod],
											aud: '*',
										}),
									],
								}),
							},
						}),
					],
				});

				expect(docs['com.example.scope'].defs.main).toEqual({
					type: 'permission-set',
					permissions: [
						{
							type: 'permission',
							resource: 'rpc',
							lxm: [
								'com.example.getPost',
								'com.example.updatePost',
								'com.example.createPost',
								'com.example.subscribePosts',
							],
							aud: '*',
						},
					],
				});
			});

			test('throws when LexRecordBuilder is not a top-level definition', () => {
				const postRecord = record({ record: object() });

				expect(() =>
					build({
						documents: [
							document({
								id: 'com.example.scope',
								defs: {
									main: permissionSet({
										permissions: [repoPermission({ collection: [postRecord] })],
									}),
								},
							}),
						],
					}),
				).toThrow('must be defined as a top-level definition');
			});

			test('throws when XRPC builder is not a top-level definition', () => {
				const getMethod = query();

				expect(() =>
					build({
						documents: [
							document({
								id: 'com.example.scope',
								defs: {
									main: permissionSet({
										permissions: [rpcPermission({ lxm: [getMethod], aud: '*' })],
									}),
								},
							}),
						],
					}),
				).toThrow('must be defined as a top-level definition');
			});
		});
	});
});
