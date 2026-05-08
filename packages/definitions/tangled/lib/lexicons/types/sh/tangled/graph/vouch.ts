import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.graph.vouch'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Whether this user is being vouched for or denounced
		 * @default "vouch"
		 */
		kind: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['denounce', 'vouch']), 'vouch'),
		/**
		 * The reason for this vouch/denouncement
		 * @maxLength 2560
		 * @maxGraphemes 256
		 */
		reason: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
				/*#__PURE__*/ v.stringLength(0, 2560),
				/*#__PURE__*/ v.stringGraphemes(0, 256),
			]),
		),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.graph.vouch': mainSchema;
	}
}
