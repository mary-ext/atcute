import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blog.pckt.block.mention')),
	/**
	 * The DID of the mentioned user (e.g., did:plc:abc123xyz). This is the canonical reference that persists even if the user changes their handle, following app.bsky.richtext.facet#mention
	 */
	did: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
