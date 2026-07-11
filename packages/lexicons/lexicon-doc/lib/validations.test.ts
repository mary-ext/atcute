import { describe, expect, test } from 'vitest';

import {
	array,
	blob,
	boolean,
	build,
	bytes,
	cidLink,
	document,
	integer,
	nullable,
	object,
	ref,
	required,
	string,
	union,
} from './builder.ts';
import type * as t from './types.ts';
import { RecordValidator } from './validations.ts';

// shared test schemas
const subjectRef = object({
	properties: {
		uri: required(string({ format: 'at-uri' })),
		cid: required(string({ format: 'cid' })),
	},
});

const docs: Record<string, t.LexiconDoc> = build({
	documents: [
		document({
			id: 'com.example.post',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							text: required(string({ maxLength: 300 })),
							createdAt: required(string({ format: 'datetime' })),
						},
					}),
				},
			},
		}),
		document({
			id: 'com.example.profile',
			defs: {
				main: {
					type: 'record',
					key: 'literal:self',
					record: object({
						properties: {
							displayName: string({ maxLength: 64 }),
							bio: string({ maxLength: 256 }),
							avatar: blob({ accept: ['image/*'], maxSize: 1000000 }),
						},
					}),
				},
			},
		}),
		document({
			id: 'com.example.like',
			defs: {
				main: {
					type: 'record',
					key: 'tid',
					record: object({
						properties: {
							subject: required(subjectRef),
							createdAt: required(string({ format: 'datetime' })),
						},
					}),
				},
				subjectRef,
			},
		}),
		document({
			id: 'com.example.settings',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							theme: string({ enum: ['light', 'dark', 'auto'], default: 'auto' }),
							notifications: boolean({ default: true }),
							maxItems: integer({ minimum: 10, maximum: 100, default: 50 }),
						},
					}),
				},
			},
		}),
		document({
			id: 'com.example.list',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							name: required(string({ minLength: 1, maxLength: 64 })),
							items: required(array({ items: string(), minLength: 1, maxLength: 100 })),
						},
					}),
				},
			},
		}),
		document({
			id: 'com.example.bytes',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							data: required(bytes({ minLength: 1, maxLength: 1024 })),
						},
					}),
				},
			},
		}),
		document({
			id: 'com.example.link',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							ref: required(cidLink()),
						},
					}),
				},
			},
		}),
		document({
			id: 'com.example.closed-union',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							entry: required(union({ closed: true, refs: [ref({ ref: '#itemA' })] })),
						},
					}),
				},
				itemA: object({
					properties: {
						value: required(string()),
					},
				}),
			},
		}),
		document({
			id: 'com.example.open-union',
			defs: {
				main: {
					type: 'record',
					record: object({
						properties: {
							entry: required(union({ refs: [ref({ ref: '#itemA' })] })),
						},
					}),
				},
				itemA: object({
					properties: {
						value: required(string()),
					},
				}),
			},
		}),
		document({
			id: 'com.example.nullable',
			defs: {
				main: {
					type: 'record',
					key: 'literal:self',
					record: object({
						properties: {
							label: required(nullable(string())),
							note: nullable(string({ default: 'hi', maxLength: 10 })),
							tag: nullable(string()),
						},
					}),
				},
			},
		}),
	],
});

describe('RecordValidator', () => {
	describe('constructor', () => {
		test('throws when nsid does not exist in docs', () => {
			expect(() => new RecordValidator(docs, 'com.example.nonexistent')).toThrow(
				"can't find document: com.example.nonexistent",
			);
		});

		test('throws when main definition is not a record', () => {
			const invalidDocs = build({
				documents: [
					document({
						id: 'com.example.notrecord',
						defs: {
							main: {
								type: 'query',
							},
						},
					}),
				],
			});

			expect(() => new RecordValidator(invalidDocs, 'com.example.notrecord')).toThrow(
				'com.example.notrecord is not a record definition (got query)',
			);
		});
	});

	describe('parse', () => {
		test('validates a simple post record', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			const result = validator.parse({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.post',
					text: 'hello world',
					createdAt: '2024-01-01T00:00:00.000Z',
				},
			});

			expect(result).toEqual({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.post',
					text: 'hello world',
					createdAt: '2024-01-01T00:00:00.000Z',
				},
			});
		});

		test('validates profile record with optional fields', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const result = validator.parse({
				key: 'self',
				object: {
					$type: 'com.example.profile',
					displayName: 'alice',
				},
			});

			expect(result.object).toHaveProperty('displayName', 'alice');
		});

		test('validates profile record with all fields', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const result = validator.parse({
				key: 'self',
				object: {
					$type: 'com.example.profile',
					displayName: 'alice',
					bio: 'software engineer',
					avatar: {
						$type: 'blob',
						ref: {
							$link: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m',
						},
						mimeType: 'image/png',
						size: 50000,
					},
				},
			});

			expect(result.object).toHaveProperty('displayName', 'alice');
			expect(result.object).toHaveProperty('bio', 'software engineer');
		});

		test('validates like record with nested object', () => {
			const validator = new RecordValidator(docs, 'com.example.like');

			const result = validator.parse({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.like',
					subject: {
						uri: 'at://did:plc:abc123/com.example.post/3m6bkzurm4c7w',
						cid: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m',
					},
					createdAt: '2024-01-01T00:00:00.000Z',
				},
			});

			expect(result.object).toHaveProperty('subject');
		});

		test('validates settings record with defaults', () => {
			const validator = new RecordValidator(docs, 'com.example.settings');

			const result = validator.parse({
				key: null,
				object: {
					$type: 'com.example.settings',
				},
			});

			expect(result.object).toBeDefined();
		});

		test('validates list record with array', () => {
			const validator = new RecordValidator(docs, 'com.example.list');

			const result = validator.parse({
				key: null,
				object: {
					$type: 'com.example.list',
					name: 'my list',
					items: ['item1', 'item2', 'item3'],
				},
			});

			expect(result.object).toHaveProperty('items');
			expect((result.object as any).items).toHaveLength(3);
		});

		test('validates bytes record', () => {
			const validator = new RecordValidator(docs, 'com.example.bytes');

			const result = validator.parse({
				key: null,
				object: {
					$type: 'com.example.bytes',
					data: { $bytes: 'AQIDBAU=' }, // base64 encoded [1, 2, 3, 4, 5]
				},
			});

			expect(result.object).toHaveProperty('data');
		});

		test('validates cid-link record', () => {
			const validator = new RecordValidator(docs, 'com.example.link');

			const result = validator.parse({
				key: null,
				object: {
					$type: 'com.example.link',
					ref: {
						$link: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m',
					},
				},
			});

			expect(result.object).toHaveProperty('ref');
		});

		test('throws when required field is missing', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			expect(() =>
				validator.parse({
					key: '3m6bkzurm4c7w',
					object: {
						$type: 'com.example.post',
						text: 'hello world',
						// missing createdAt
					},
				}),
			).toThrow();
		});

		test('throws when string exceeds maxLength', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			expect(() =>
				validator.parse({
					key: '3m6bkzurm4c7w',
					object: {
						$type: 'com.example.post',
						text: 'a'.repeat(301),
						createdAt: '2024-01-01T00:00:00.000Z',
					},
				}),
			).toThrow();
		});

		test('throws when string format is invalid', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			expect(() =>
				validator.parse({
					key: '3m6bkzurm4c7w',
					object: {
						$type: 'com.example.post',
						text: 'hello world',
						createdAt: 'not a datetime',
					},
				}),
			).toThrow();
		});

		test('throws when enum value is invalid', () => {
			const validator = new RecordValidator(docs, 'com.example.settings');

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.settings',
						theme: 'invalid',
					},
				}),
			).toThrow();
		});

		test('throws when integer is below minimum', () => {
			const validator = new RecordValidator(docs, 'com.example.settings');

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.settings',
						maxItems: 5,
					},
				}),
			).toThrow();
		});

		test('throws when integer is above maximum', () => {
			const validator = new RecordValidator(docs, 'com.example.settings');

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.settings',
						maxItems: 150,
					},
				}),
			).toThrow();
		});

		test('throws when array is empty but minLength is 1', () => {
			const validator = new RecordValidator(docs, 'com.example.list');

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.list',
						name: 'my list',
						items: [],
					},
				}),
			).toThrow();
		});

		test('throws when array exceeds maxLength', () => {
			const validator = new RecordValidator(docs, 'com.example.list');

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.list',
						name: 'my list',
						items: Array(101).fill('item'),
					},
				}),
			).toThrow();
		});

		test('throws when bytes is below minLength', () => {
			const validator = new RecordValidator(docs, 'com.example.bytes');

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.bytes',
						data: { $bytes: '' }, // empty bytes
					},
				}),
			).toThrow();
		});

		test('throws when bytes exceeds maxLength', () => {
			const validator = new RecordValidator(docs, 'com.example.bytes');

			// base64 string representing 1025 bytes (exceeds maxLength of 1024)
			const largeBytes = { $bytes: 'A'.repeat(1368) }; // base64 of ~1025 bytes

			expect(() =>
				validator.parse({
					key: null,
					object: {
						$type: 'com.example.bytes',
						data: largeBytes,
					},
				}),
			).toThrow();
		});

		test('throws when record key does not match literal constraint', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			expect(() =>
				validator.parse({
					key: 'wrong',
					object: {
						$type: 'com.example.profile',
					},
				}),
			).toThrow();
		});

		test('throws when record key is not a tid', () => {
			const validator = new RecordValidator(docs, 'com.example.like');

			expect(() =>
				validator.parse({
					key: 'not-a-tid',
					object: {
						$type: 'com.example.like',
						subject: {
							uri: 'at://did:plc:abc123/com.example.post/3m6bkzurm4c7w',
							cid: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m',
						},
						createdAt: '2024-01-01T00:00:00.000Z',
					},
				}),
			).toThrow();
		});
	});

	describe('optional and nullable fields', () => {
		test('accepts omitting an optional nullable field and applies its default', () => {
			const validator = new RecordValidator(docs, 'com.example.nullable');

			const result = validator.parse({
				key: 'self',
				object: {
					$type: 'com.example.nullable',
					label: null,
				},
			});

			expect((result.object as any).note).toBe('hi');
			expect(result.object as any).not.toHaveProperty('tag');
		});

		test('accepts null on an optional nullable field without applying the default', () => {
			const validator = new RecordValidator(docs, 'com.example.nullable');

			const result = validator.parse({
				key: 'self',
				object: {
					$type: 'com.example.nullable',
					label: 'x',
					note: null,
					tag: null,
				},
			});

			expect((result.object as any).note).toBeNull();
			expect((result.object as any).tag).toBeNull();
		});

		test('still validates the wrapped schema of an optional nullable field', () => {
			const validator = new RecordValidator(docs, 'com.example.nullable');

			expect(() =>
				validator.parse({
					key: 'self',
					object: {
						$type: 'com.example.nullable',
						label: null,
						note: 'waytoolongvalue',
					},
				}),
			).toThrow();
		});

		test('rejects omitting a required nullable field', () => {
			const validator = new RecordValidator(docs, 'com.example.nullable');

			expect(() =>
				validator.parse({
					key: 'self',
					object: {
						$type: 'com.example.nullable',
					},
				}),
			).toThrow();
		});
	});

	describe('ref fields', () => {
		test('rejects a record missing a required ref field', () => {
			const validator = new RecordValidator(docs, 'com.example.like');

			expect(() =>
				validator.parse({
					key: '3m6bkzurm4c7w',
					object: {
						$type: 'com.example.like',
						createdAt: '2024-01-01T00:00:00.000Z',
					},
				}),
			).toThrow();
		});

		test('validates the target schema of a ref field', () => {
			const validator = new RecordValidator(docs, 'com.example.like');

			expect(() =>
				validator.parse({
					key: '3m6bkzurm4c7w',
					object: {
						$type: 'com.example.like',
						subject: { uri: 'not-an-at-uri', cid: 'not-a-cid' },
						createdAt: '2024-01-01T00:00:00.000Z',
					},
				}),
			).toThrow();
		});
	});

	describe('unions', () => {
		test('closed union rejects an unknown member $type', () => {
			const validator = new RecordValidator(docs, 'com.example.closed-union');

			expect(() =>
				validator.parse({
					key: '3m6bkzurm4c7w',
					object: {
						$type: 'com.example.closed-union',
						entry: { $type: 'com.example.closed-union#itemB', value: 'x' },
					},
				}),
			).toThrow();
		});

		test('closed union accepts a declared member $type', () => {
			const validator = new RecordValidator(docs, 'com.example.closed-union');

			const result = validator.parse({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.closed-union',
					entry: { $type: 'com.example.closed-union#itemA', value: 'x' },
				},
			});

			expect((result.object as any).entry.value).toBe('x');
		});

		test('open union accepts an unknown member $type', () => {
			const validator = new RecordValidator(docs, 'com.example.open-union');

			const result = validator.parse({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.open-union',
					entry: { $type: 'com.example.open-union#itemB', value: 'x' },
				},
			});

			expect((result.object as any).entry.$type).toBe('com.example.open-union#itemB');
		});
	});

	describe('try', () => {
		test('returns success result for valid input', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			const result = validator.try({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.post',
					text: 'hello world',
					createdAt: '2024-01-01T00:00:00.000Z',
				},
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.object).toHaveProperty('text', 'hello world');
			}
		});

		test('returns error result for invalid input', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			const result = validator.try({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.post',
					text: 'hello world',
					// missing createdAt
				},
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.issues).toBeDefined();
			}
		});
	});

	describe('is', () => {
		test('returns true for valid input', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			const result = validator.is({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.post',
					text: 'hello world',
					createdAt: '2024-01-01T00:00:00.000Z',
				},
			});

			expect(result).toBe(true);
		});

		test('returns false for invalid input', () => {
			const validator = new RecordValidator(docs, 'com.example.post');

			const result = validator.is({
				key: '3m6bkzurm4c7w',
				object: {
					$type: 'com.example.post',
					text: 'hello world',
					// missing createdAt
				},
			});

			expect(result).toBe(false);
		});
	});

	describe('strict mode', () => {
		test('validates blob size in strict mode', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const input = {
				key: 'self',
				object: {
					$type: 'com.example.profile',
					displayName: 'alice',
					avatar: {
						$type: 'blob',
						ref: { $link: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m' },
						mimeType: 'image/png',
						size: 50000,
					},
				},
			};

			// passes without strict (constraints are inert)
			expect(validator.is(input)).toBe(true);

			// passes with strict (50000 < 1000000 maxSize)
			expect(validator.is(input, { strict: true })).toBe(true);
		});

		test('rejects blob exceeding maxSize in strict mode', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const input = {
				key: 'self',
				object: {
					$type: 'com.example.profile',
					avatar: {
						$type: 'blob',
						ref: { $link: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m' },
						mimeType: 'image/png',
						size: 2000000,
					},
				},
			};

			// passes without strict
			expect(validator.is(input)).toBe(true);

			// fails with strict (2000000 > 1000000 maxSize)
			expect(validator.is(input, { strict: true })).toBe(false);
		});

		test('rejects blob with wrong MIME type in strict mode', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const input = {
				key: 'self',
				object: {
					$type: 'com.example.profile',
					avatar: {
						$type: 'blob',
						ref: { $link: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m' },
						mimeType: 'video/mp4',
						size: 50000,
					},
				},
			};

			// passes without strict
			expect(validator.is(input)).toBe(true);

			// fails with strict (video/mp4 doesn't match image/*)
			expect(validator.is(input, { strict: true })).toBe(false);
		});

		test('rejects legacy blobs in strict mode', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const input = {
				key: 'self',
				object: {
					$type: 'com.example.profile',
					avatar: {
						cid: 'bafkreidjmlrsggn2shrihfyp4iwlmxdp4dso7iqbkhfrpq6ahm22obop34',
						mimeType: 'image/jpeg',
					},
				},
			};

			// passes without strict (legacy blobs are transformed)
			expect(validator.is(input)).toBe(true);

			// fails with strict (legacy blobs rejected)
			expect(validator.is(input, { strict: true })).toBe(false);
		});

		test('try() reports strict validation issues', () => {
			const validator = new RecordValidator(docs, 'com.example.profile');

			const result = validator.try(
				{
					key: 'self',
					object: {
						$type: 'com.example.profile',
						avatar: {
							$type: 'blob',
							ref: { $link: 'bafyreihvzsz6wxhv5idsmsjfbx5jdmfrqx3h4oqw2vvxpwzcdpavqzkp4m' },
							mimeType: 'image/png',
							size: 2000000,
						},
					},
				},
				{ strict: true },
			);

			expect(result.ok).toBe(false);
		});
	});
});
