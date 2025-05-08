import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '@atcute/bluesky/types/app/actor/defs';
import * as AppBskyRichtextFacet from '@atcute/bluesky/types/app/richtext/facet';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _collectionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.collection.defs#collectionView')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 64)]),
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	get descriptionFacets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
	},
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	collectionItemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
});

type collectionView$schematype = typeof _collectionViewSchema;

export interface collectionViewSchema extends collectionView$schematype {}

export const collectionViewSchema = _collectionViewSchema as collectionViewSchema;

export interface CollectionView extends v.InferInput<typeof collectionViewSchema> {}
