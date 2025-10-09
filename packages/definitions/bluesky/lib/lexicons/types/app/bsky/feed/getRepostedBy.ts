import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getRepostedBy', {
	params: /*#__PURE__*/ v.object({
		/**
		 * If supplied, filters to reposts of specific version (by CID) of the post record.
		 */
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/**
		 * Reference (AT-URI) of post record
		 */
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get repostedBy() {
				return /*#__PURE__*/ v.array(AppBskyActorDefs.profileViewSchema);
			},
			uri: /*#__PURE__*/ v.resourceUriString(),
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
		'app.bsky.feed.getRepostedBy': mainSchema;
	}
}
