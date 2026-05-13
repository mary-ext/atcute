import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('fyi.unravel.frontpage.comment'),
		/**
		 * The content of the comment.
		 *
		 * @maxLength 100000
		 * @maxGraphemes 10000
		 */
		content: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 100000),
			/*#__PURE__*/ v.stringGraphemes(0, 10000),
		]),
		/** Client-declared timestamp when this comment was originally created. */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get parent() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		get post() {
			return ComAtprotoRepoStrongRef.mainSchema;
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'fyi.unravel.frontpage.comment': mainSchema;
	}
}
