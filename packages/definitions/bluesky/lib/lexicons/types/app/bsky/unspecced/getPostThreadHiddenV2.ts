import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyUnspeccedDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.getPostThreadHiddenV2', {
	params: /*#__PURE__*/ v.object({
		anchor: /*#__PURE__*/ v.resourceUriString(),
		prioritizeFollowedUsers: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get thread() {
				return /*#__PURE__*/ v.array(threadHiddenItemSchema);
			},
		}),
	},
});
const _threadHiddenItemSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.getPostThreadHiddenV2#threadHiddenItem'),
	),
	depth: /*#__PURE__*/ v.integer(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get value() {
		return /*#__PURE__*/ v.variant([AppBskyUnspeccedDefs.threadItemPostSchema]);
	},
});

type main$schematype = typeof _mainSchema;
type threadHiddenItem$schematype = typeof _threadHiddenItemSchema;

export interface mainSchema extends main$schematype {}
export interface threadHiddenItemSchema extends threadHiddenItem$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const threadHiddenItemSchema = _threadHiddenItemSchema as threadHiddenItemSchema;

export interface ThreadHiddenItem extends v.InferInput<typeof threadHiddenItemSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.unspecced.getPostThreadHiddenV2': mainSchema;
	}
}
