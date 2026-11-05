import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.git.temp2.getCommitStats', {
	params: /*#__PURE__*/ v.object({
		/** Actor whose commits to count. */
		actor: /*#__PURE__*/ v.didString(),
		/**
		 * @default 7
		 * @minimum 1
		 * @maximum 24
		 */
		months: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 24)]),
			7,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** @maxLength 24 */
			get months() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(monthSchema), [
					/*#__PURE__*/ v.arrayLength(0, 24),
				]);
			},
		}),
	},
});
const _monthSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.temp2.getCommitStats#month')),
	/**
	 * Commits attributed to the actor during this month.
	 *
	 * @minimum 0
	 */
	commits: /*#__PURE__*/ v.integer(),
	/** Start of this UTC calendar month. */
	start: /*#__PURE__*/ v.datetimeString(),
});

type main$schematype = typeof _mainSchema;
type month$schematype = typeof _monthSchema;

export interface mainSchema extends main$schematype {}
export interface monthSchema extends month$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const monthSchema = _monthSchema as monthSchema;

export interface Month extends v.InferInput<typeof monthSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.git.temp2.getCommitStats': mainSchema;
	}
}
