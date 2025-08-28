import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as PubLeafletRichtextFacet from './richtext/facet.js';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.comment'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get facets() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(PubLeafletRichtextFacet.mainSchema));
		},
		plaintext: /*#__PURE__*/ v.string(),
		get reply() {
			return /*#__PURE__*/ v.optional(replyRefSchema);
		},
		subject: /*#__PURE__*/ v.resourceUriString(),
	}),
);
const _replyRefSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.comment#replyRef')),
	parent: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type replyRef$schematype = typeof _replyRefSchema;

export interface mainSchema extends main$schematype {}
export interface replyRefSchema extends replyRef$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const replyRefSchema = _replyRefSchema as replyRefSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface ReplyRef extends v.InferInput<typeof replyRefSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.comment': mainSchema;
	}
}
