import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _disableRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.postgate#disableRule')),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.feed.postgate'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * List of AT-URIs embedding this post that the author has detached from.
		 * @maxLength 50
		 */
		detachedEmbeddingUris: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()), [
				/*#__PURE__*/ v.arrayLength(0, 50),
			]),
		),
		/**
		 * List of rules defining who can embed this post. If value is an empty array or is undefined, no particular rules apply and anyone can embed.
		 * @maxLength 5
		 */
		get embeddingRules() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([disableRuleSchema])), [
					/*#__PURE__*/ v.arrayLength(0, 5),
				]),
			);
		},
		/**
		 * Reference (AT-URI) to the post record.
		 */
		post: /*#__PURE__*/ v.resourceUriString(),
	}),
);

type disableRule$schematype = typeof _disableRuleSchema;
type main$schematype = typeof _mainSchema;

export interface disableRuleSchema extends disableRule$schematype {}
export interface mainSchema extends main$schematype {}

export const disableRuleSchema = _disableRuleSchema as disableRuleSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface DisableRule extends v.InferInput<typeof disableRuleSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.feed.postgate': mainSchema;
	}
}
