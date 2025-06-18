import { describe, expect, it, vi } from 'vitest';

import * as v from './index.js';
import { allowsEval } from './utils.js';

describe.each([[false], [true]])(`with eval: %p`, (withEval) => {
	it('performs validation', () => {
		using _mock = vi.spyOn(allowsEval, 'value', 'get').mockReturnValue(withEval);

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
			integerFilled: v.optional(v.integer()),
			integerOptional: v.optional(v.integer()),
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

		const datetime = new Date().toISOString();

		const res: v.InferInput<typeof recordSchema> = {
			$type: 'com.example.kitchenSink',
			object: {
				object: { boolean: true },
				array: ['one', 'two'],
				boolean: true,
				integer: 123,
				integerFilled: 234,
				string: 'string',
			},
			array: ['one', 'two'],
			boolean: true,
			integer: 123,
			string: 'string',
			datetime: datetime,
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

		const result = v.parse(recordSchema, res);
		expect(result).toEqual({
			$type: 'com.example.kitchenSink',
			array: ['one', 'two'],
			atUri: 'at://did:web:example.com/com.example.test/self',
			boolean: true,
			bytes: {
				$bytes: 'AAECAw',
			},
			cid: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a',
			cidLink: {
				$link: 'bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a',
			},
			datetime: datetime,
			did: 'did:web:example.com',
			integer: 123,
			object: {
				array: ['one', 'two'],
				boolean: true,
				integer: 123,
				integerFilled: 234,
				integerWithDefault: 42,
				integerWithDefaultFn: 421,
				object: {
					boolean: true,
				},
				string: 'string',
			},
			string: 'string',
		});
	});
});
