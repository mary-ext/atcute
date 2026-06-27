import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.postsList')),
	filterByTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	highlightFirstPost: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Show at most this many posts.
	 *
	 * @minimum 1
	 */
	limit: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	),
	view: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'medium' | 'small' | (string & {})>()),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
