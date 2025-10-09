import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.notification.declaration'),
		/**
		 * A declaration of the user's preference for allowing activity subscriptions from other users. Absence of a record implies 'followers'.
		 */
		allowSubscriptions: /*#__PURE__*/ v.string<'followers' | 'mutuals' | 'none' | (string & {})>(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.notification.declaration': mainSchema;
	}
}
