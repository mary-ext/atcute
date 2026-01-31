import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.content')),
	/**
	 * Reference to external JSON blob containing content (extended mode, used when content > 20KB)
	 */
	blob: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
	/**
	 * Array of content blocks (inline mode, used when content ≤ 20KB)
	 */
	get items() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([])));
	},
	/**
	 * Array of blob references (full objects) used in the content (required in extended mode to prevent garbage collection)
	 */
	references: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.blob())),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
