import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '@atcute/bluesky/types/app/actor/defs';
import * as AppBskyRichtextFacet from '@atcute/bluesky/types/app/richtext/facet';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _collectionViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.collection.defs#collectionView')),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	cid: /*#__PURE__*/ v.cidString(),
	/**
	 * @minimum 0
	 */
	collectionItemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	/**
	 * @maxLength 3000
	 * @maxGraphemes 300
	 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 3000),
			/*#__PURE__*/ v.stringGraphemes(0, 300),
		]),
	),
	get descriptionFacets() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(AppBskyRichtextFacet.mainSchema));
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minLength 1
	 * @maxLength 64
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 64)]),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type collectionView$schematype = typeof _collectionViewSchema;

export interface collectionViewSchema extends collectionView$schematype {}

export const collectionViewSchema = _collectionViewSchema as collectionViewSchema;

export interface CollectionView extends v.InferInput<typeof collectionViewSchema> {}
