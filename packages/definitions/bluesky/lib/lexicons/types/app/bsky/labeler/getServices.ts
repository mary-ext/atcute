import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyLabelerDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.labeler.getServices', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default false
		 */
		detailed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * @minLength 1
		 */
		dids: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(1),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get views() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						AppBskyLabelerDefs.labelerViewSchema,
						AppBskyLabelerDefs.labelerViewDetailedSchema,
					]),
				);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.labeler.getServices': mainSchema;
	}
}
