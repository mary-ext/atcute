import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.graph.listitem'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * Reference (AT-URI) to the list record (app.bsky.graph.list).
		 */
		list: /*#__PURE__*/ v.resourceUriString(),
		/**
		 * The account which is included on the list.
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
		'app.bsky.graph.listitem': mainSchema;
	}
}
