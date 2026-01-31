import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlogPcktBlockTableCell from './tableCell.js';
import * as BlogPcktBlockTableHeader from './tableHeader.js';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.tableRow')),
	/**
	 * Array of table cells or header cells
	 */
	get content() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([BlogPcktBlockTableCell.mainSchema, BlogPcktBlockTableHeader.mainSchema]),
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
