import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.getMergeBase', {
	params: /*#__PURE__*/ v.object({
		/** Commit used to find the common base. */
		base: /*#__PURE__*/ v.string(),
		/** Commit to list history for. */
		head: /*#__PURE__*/ v.string(),
		/**
		 * DIDs of the repositories to read objects from
		 *
		 * @minLength 1
		 * @maxLength 2
		 */
		repos: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(1, 2),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			commit: /*#__PURE__*/ v.string(),
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
		'org.tangled.temp.git.getMergeBase': mainSchema;
	}
}
