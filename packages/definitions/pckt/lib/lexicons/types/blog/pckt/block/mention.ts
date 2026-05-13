import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.mention')),
	/**
	 * The DID of the mentioned user (e.g., did:plc:abc123xyz). This is the canonical reference that persists
	 * even if the user changes their handle, following app.bsky.richtext.facet#mention
	 */
	did: /*#__PURE__*/ v.didString(),
	/**
	 * The handle of the mentioned user at the time of mention (e.g., alice.bsky.social). Used for display text
	 * and byte offset calculation in facets.
	 *
	 * @maxLength 253
	 */
	handle: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.handleString(), [/*#__PURE__*/ v.stringLength(0, 253)]),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
