import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('community.lexicon.payments.webMonetization'),
		/** Wallet address. */
		address: /*#__PURE__*/ v.genericUriString(),
		/** Short, human-readable description of how this wallet is related to this account. */
		note: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'community.lexicon.payments.webMonetization': mainSchema;
	}
}
