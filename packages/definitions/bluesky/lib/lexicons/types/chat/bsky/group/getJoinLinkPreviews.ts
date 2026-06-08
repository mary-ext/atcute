import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ChatBskyGroupDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.group.getJoinLinkPreviews', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minLength 1
		 * @maxLength 50
		 */
		codes: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get joinLinkPreviews() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ChatBskyGroupDefs.disabledJoinLinkPreviewViewSchema,
						ChatBskyGroupDefs.invalidJoinLinkPreviewViewSchema,
						ChatBskyGroupDefs.joinLinkPreviewViewSchema,
					]),
				);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'chat.bsky.group.getJoinLinkPreviews': mainSchema;
	}
}
