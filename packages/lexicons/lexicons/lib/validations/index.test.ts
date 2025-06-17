import { expect, it } from 'vitest';

import * as v from './index.js';

it('performs validation', () => {
	const subobjectSchema = v.object({
		$type: v.optional(v.literal('com.example.kitchenSink#subobject')),
		boolean: v.boolean(),
	});

	const objectSchema = v.object({
		$type: v.optional(v.literal('com.example.kitchenSink#object')),
		get object() {
			return subobjectSchema;
		},
		array: v.array(v.string()),
		boolean: v.boolean(),
		integer: v.integer(),
		integerWithDefault: v.optional(v.integer(), 42),
		integerWithDefaultFn: v.optional(v.integer(), () => 421),
		string: v.string(),
	});

	const recordSchema = v.record(
		v.tidString(),
		v.object({
			$type: v.literal('com.example.kitchenSink'),
			get object() {
				return objectSchema;
			},
			array: v.array(v.string()),
			boolean: v.boolean(),
			integer: v.integer(),
			string: v.string(),

			atUri: v.resourceUriString(),
			datetime: v.datetimeString(),
			did: v.didString(),
			cid: v.cidString(),

			bytes: v.bytes(),
			cidLink: v.cidLink(),
		}),
	);

	const res: v.InferInput<typeof recordSchema> = {
		$type: 'com.example.kitchenSink',
		object: {
			object: { boolean: true },
			array: ['one', 'two'],
			boolean: true,
			integer: 123,
			string: 'string',
		},
		array: ['one', 'two'],
		boolean: true,
		integer: 123,
		string: 'string',
		datetime: new Date().toISOString(),
		atUri: 'at://did:web:example.com/com.example.test/self',
		did: 'did:web:example.com',
		cid: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a',
		bytes: {
			$bytes: 'AAECAw',
		},
		cidLink: {
			$link: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a',
		},
	};

	v.parse(recordSchema, res);
});

it('sets optional defaults', () => {
	const objectSchema = v.object({
		foo: v.optional(v.integer(), 123),
	});

	expect(v.parse(objectSchema, {})).toEqual({ foo: 123 });
});
