import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.literal('self'),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('chat.bsky.actor.declaration'),
		/**
		 * [NOTE: This is under active development and should be considered unstable while this note is here]. Declaration about group chat invitation preferences for the record owner.
		 */
		allowGroupInvites: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'all' | 'following' | 'none' | (string & {})>(),
		),
		allowIncoming: /*#__PURE__*/ v.string<'all' | 'following' | 'none' | (string & {})>(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'chat.bsky.actor.declaration': mainSchema;
	}
}
