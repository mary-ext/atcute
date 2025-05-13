import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyActorDefs from '../actor/defs.js';

const _likeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.getLikes#like')),
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	get actor() {
		return AppBskyActorDefs.profileViewSchema;
	},
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.getLikes', {
	params: /*#__PURE__*/ v.object({
		uri: /*#__PURE__*/ v.resourceUriString(),
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			uri: /*#__PURE__*/ v.resourceUriString(),
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get likes() {
				return /*#__PURE__*/ v.array(likeSchema);
			},
		}),
	},
});

type like$schematype = typeof _likeSchema;
type main$schematype = typeof _mainSchema;

export interface likeSchema extends like$schematype {}
export interface mainSchema extends main$schematype {}

export const likeSchema = _likeSchema as likeSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Like extends v.InferInput<typeof likeSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.getLikes': mainSchema;
	}
}
