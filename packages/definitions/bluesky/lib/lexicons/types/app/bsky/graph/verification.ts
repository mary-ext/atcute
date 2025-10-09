import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.graph.verification'),
		/**
		 * Date of when the verification was created.
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Display name of the subject the verification applies to at the moment of verifying, which might not be the same at the time of viewing. The verification is only valid if the current displayName matches the one at the time of verifying.
		 */
		displayName: /*#__PURE__*/ v.string(),
		/**
		 * Handle of the subject the verification applies to at the moment of verifying, which might not be the same at the time of viewing. The verification is only valid if the current handle matches the one at the time of verifying.
		 */
		handle: /*#__PURE__*/ v.handleString(),
		/**
		 * DID of the subject the verification applies to.
		 */
		subject: /*#__PURE__*/ v.didString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.graph.verification': mainSchema;
	}
}
