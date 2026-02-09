import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as AppBskyActorDefs from '@atcute/bluesky/types/app/actor/defs';
import * as AppBskyRichtextFacet from '@atcute/bluesky/types/app/richtext/facet';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as BlueMojiCollectionItem from '../collection/item.ts';
import * as BlueMojiRichtextFacet from '../richtext/facet.ts';

const _packItemViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.packs.defs#packItemView')),
	get subject() {
		return BlueMojiCollectionItem.itemViewSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _packViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.packs.defs#packView')),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	cid: /*#__PURE__*/ v.cidString(),
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
	/**
	 * @minimum 0
	 */
	packItemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(packViewerStateSchema);
	},
});
const _packViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.packs.defs#packViewBasic')),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	cid: /*#__PURE__*/ v.cidString(),
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
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(BlueMojiRichtextFacet.mainSchema));
	},
	indexedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * @minimum 0
	 */
	itemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minLength 1
	 * @maxLength 64
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 64)]),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(packViewerStateSchema);
	},
});
const _packViewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('blue.moji.packs.defs#packViewerState')),
	savedToCollection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});

type packItemView$schematype = typeof _packItemViewSchema;
type packView$schematype = typeof _packViewSchema;
type packViewBasic$schematype = typeof _packViewBasicSchema;
type packViewerState$schematype = typeof _packViewerStateSchema;

export interface packItemViewSchema extends packItemView$schematype {}
export interface packViewSchema extends packView$schematype {}
export interface packViewBasicSchema extends packViewBasic$schematype {}
export interface packViewerStateSchema extends packViewerState$schematype {}

export const packItemViewSchema = _packItemViewSchema as packItemViewSchema;
export const packViewSchema = _packViewSchema as packViewSchema;
export const packViewBasicSchema = _packViewBasicSchema as packViewBasicSchema;
export const packViewerStateSchema = _packViewerStateSchema as packViewerStateSchema;

export interface PackItemView extends v.InferInput<typeof packItemViewSchema> {}
export interface PackView extends v.InferInput<typeof packViewSchema> {}
export interface PackViewBasic extends v.InferInput<typeof packViewBasicSchema> {}
export interface PackViewerState extends v.InferInput<typeof packViewerStateSchema> {}
