import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _eventConvoFirstMessageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('chat.bsky.moderation.subscribeModEvents#eventConvoFirstMessage'),
	),
	convoId: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	messageId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The list of DIDs message recipients. Does not include the sender, which is in the `user` field
	 */
	recipients: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
	rev: /*#__PURE__*/ v.string(),
	/**
	 * The DID of the message author.
	 */
	user: /*#__PURE__*/ v.didString(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('chat.bsky.moderation.subscribeModEvents', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The last known event seq number to backfill from. Use '2222222222222' to backfill from the beginning. Don't specify a cursor to listen only for new events.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([eventConvoFirstMessageSchema]);
	},
});

type eventConvoFirstMessage$schematype = typeof _eventConvoFirstMessageSchema;
type main$schematype = typeof _mainSchema;

export interface eventConvoFirstMessageSchema extends eventConvoFirstMessage$schematype {}
export interface mainSchema extends main$schematype {}

export const eventConvoFirstMessageSchema = _eventConvoFirstMessageSchema as eventConvoFirstMessageSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface EventConvoFirstMessage extends v.InferInput<typeof eventConvoFirstMessageSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'chat.bsky.moderation.subscribeModEvents': mainSchema;
	}
}
