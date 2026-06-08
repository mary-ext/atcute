import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyGroupDefs from '../group/defs.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.embed.joinLink')),
	/** The join link code. */
	code: /*#__PURE__*/ v.string(),
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.embed.joinLink#view')),
	get joinLinkPreview() {
		return /*#__PURE__*/ v.variant([
			ChatBskyGroupDefs.disabledJoinLinkPreviewViewSchema,
			ChatBskyGroupDefs.invalidJoinLinkPreviewViewSchema,
			ChatBskyGroupDefs.joinLinkPreviewViewSchema,
		]);
	},
});

type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;

export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
