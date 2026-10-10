import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktBlockColumn from './column.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.columns')),
	/**
	 * The two columns, left then right
	 *
	 * @minLength 2
	 * @maxLength 2
	 */
	get content() {
		return /*#__PURE__*/ v.constrain(
			/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([BlogPcktBlockColumn.mainSchema], true)),
			[/*#__PURE__*/ v.arrayLength(2, 2)],
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
