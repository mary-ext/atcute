import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.actor.contentVisibilityDeclaration'),
		/**
		 * Whether the account requests that its posts be hidden from algorithmic recommendations. Consumers must
		 * treat a missing record as false.
		 */
		hideFromAlgorithmicRecommendations: /*#__PURE__*/ v.boolean(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.actor.contentVisibilityDeclaration': mainSchema;
	}
}
