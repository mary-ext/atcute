import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyEmbedExternal from '../embed/external.js';

const _liveSchema = /*#__PURE__*/ v.literal('app.bsky.actor.status#live');
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('app.bsky.actor.status'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * The duration of the status in minutes. Applications can choose to impose minimum and maximum limits.
		 * @minimum 1
		 */
		durationMinutes: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
		),
		/**
		 * An optional embed associated with the status.
		 */
		get embed() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([AppBskyEmbedExternal.mainSchema]));
		},
		/**
		 * The status for the account.
		 */
		status: /*#__PURE__*/ v.string<'app.bsky.actor.status#live' | (string & {})>(),
	}),
);

type live$schematype = typeof _liveSchema;
type main$schematype = typeof _mainSchema;

export interface liveSchema extends live$schematype {}
export interface mainSchema extends main$schematype {}

export const liveSchema = _liveSchema as liveSchema;
export const mainSchema = _mainSchema as mainSchema;

export type Live = v.InferInput<typeof liveSchema>;
export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'app.bsky.actor.status': mainSchema;
	}
}
