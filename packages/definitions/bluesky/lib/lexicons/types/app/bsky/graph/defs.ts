import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as AppBskyFeedDefs from '../feed/defs.js';
import * as AppBskyRichtextFacet from '../richtext/facet.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _curatelistSchema = /*#__PURE__*/ v.literal('app.bsky.graph.defs#curatelist');
const _listItemViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#listItemView')),
	get subject() {
		return AppBskyActorDefs.profileViewSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _listPurposeSchema = /*#__PURE__*/ v.string<
	| 'app.bsky.graph.defs#curatelist'
	| 'app.bsky.graph.defs#modlist'
	| 'app.bsky.graph.defs#referencelist'
	| (string & {})
>();
const _listViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#listView')),
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
	 * @minimum 0
	 */
	listItemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * @minLength 1
	 * @maxLength 64
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 64)]),
	get purpose() {
		return listPurposeSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(listViewerStateSchema);
	},
});
const _listViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#listViewBasic')),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	cid: /*#__PURE__*/ v.cidString(),
	indexedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minimum 0
	 */
	listItemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * @minLength 1
	 * @maxLength 64
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 64)]),
	get purpose() {
		return listPurposeSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(listViewerStateSchema);
	},
});
const _listViewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#listViewerState')),
	blocked: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	muted: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
});
const _modlistSchema = /*#__PURE__*/ v.literal('app.bsky.graph.defs#modlist');
const _notFoundActorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#notFoundActor')),
	actor: /*#__PURE__*/ v.actorIdentifierString(),
	notFound: /*#__PURE__*/ v.literal(true),
});
const _referencelistSchema = /*#__PURE__*/ v.literal('app.bsky.graph.defs#referencelist');
const _relationshipSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#relationship')),
	did: /*#__PURE__*/ v.didString(),
	/**
	 * if the actor is followed by this DID, contains the AT-URI of the follow record
	 */
	followedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	/**
	 * if the actor follows this DID, this is the AT-URI of the follow record
	 */
	following: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});
const _starterPackViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#starterPackView')),
	cid: /*#__PURE__*/ v.cidString(),
	get creator() {
		return AppBskyActorDefs.profileViewBasicSchema;
	},
	/**
	 * @maxLength 3
	 */
	get feeds() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(AppBskyFeedDefs.generatorViewSchema), [
				/*#__PURE__*/ v.arrayLength(0, 3),
			]),
		);
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * @minimum 0
	 */
	joinedAllTimeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * @minimum 0
	 */
	joinedWeekCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get list() {
		return /*#__PURE__*/ v.optional(listViewBasicSchema);
	},
	/**
	 * @maxLength 12
	 */
	get listItemsSample() {
		return /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(listItemViewSchema), [
				/*#__PURE__*/ v.arrayLength(0, 12),
			]),
		);
	},
	record: /*#__PURE__*/ v.unknown(),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _starterPackViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.graph.defs#starterPackViewBasic')),
	cid: /*#__PURE__*/ v.cidString(),
	get creator() {
		return AppBskyActorDefs.profileViewBasicSchema;
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * @minimum 0
	 */
	joinedAllTimeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * @minimum 0
	 */
	joinedWeekCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minimum 0
	 */
	listItemCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	record: /*#__PURE__*/ v.unknown(),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type curatelist$schematype = typeof _curatelistSchema;
type listItemView$schematype = typeof _listItemViewSchema;
type listPurpose$schematype = typeof _listPurposeSchema;
type listView$schematype = typeof _listViewSchema;
type listViewBasic$schematype = typeof _listViewBasicSchema;
type listViewerState$schematype = typeof _listViewerStateSchema;
type modlist$schematype = typeof _modlistSchema;
type notFoundActor$schematype = typeof _notFoundActorSchema;
type referencelist$schematype = typeof _referencelistSchema;
type relationship$schematype = typeof _relationshipSchema;
type starterPackView$schematype = typeof _starterPackViewSchema;
type starterPackViewBasic$schematype = typeof _starterPackViewBasicSchema;

export interface curatelistSchema extends curatelist$schematype {}
export interface listItemViewSchema extends listItemView$schematype {}
export interface listPurposeSchema extends listPurpose$schematype {}
export interface listViewSchema extends listView$schematype {}
export interface listViewBasicSchema extends listViewBasic$schematype {}
export interface listViewerStateSchema extends listViewerState$schematype {}
export interface modlistSchema extends modlist$schematype {}
export interface notFoundActorSchema extends notFoundActor$schematype {}
export interface referencelistSchema extends referencelist$schematype {}
export interface relationshipSchema extends relationship$schematype {}
export interface starterPackViewSchema extends starterPackView$schematype {}
export interface starterPackViewBasicSchema extends starterPackViewBasic$schematype {}

export const curatelistSchema = _curatelistSchema as curatelistSchema;
export const listItemViewSchema = _listItemViewSchema as listItemViewSchema;
export const listPurposeSchema = _listPurposeSchema as listPurposeSchema;
export const listViewSchema = _listViewSchema as listViewSchema;
export const listViewBasicSchema = _listViewBasicSchema as listViewBasicSchema;
export const listViewerStateSchema = _listViewerStateSchema as listViewerStateSchema;
export const modlistSchema = _modlistSchema as modlistSchema;
export const notFoundActorSchema = _notFoundActorSchema as notFoundActorSchema;
export const referencelistSchema = _referencelistSchema as referencelistSchema;
export const relationshipSchema = _relationshipSchema as relationshipSchema;
export const starterPackViewSchema = _starterPackViewSchema as starterPackViewSchema;
export const starterPackViewBasicSchema = _starterPackViewBasicSchema as starterPackViewBasicSchema;

export type Curatelist = v.InferInput<typeof curatelistSchema>;
export interface ListItemView extends v.InferInput<typeof listItemViewSchema> {}
export type ListPurpose = v.InferInput<typeof listPurposeSchema>;
export interface ListView extends v.InferInput<typeof listViewSchema> {}
export interface ListViewBasic extends v.InferInput<typeof listViewBasicSchema> {}
export interface ListViewerState extends v.InferInput<typeof listViewerStateSchema> {}
export type Modlist = v.InferInput<typeof modlistSchema>;
export interface NotFoundActor extends v.InferInput<typeof notFoundActorSchema> {}
export type Referencelist = v.InferInput<typeof referencelistSchema>;
export interface Relationship extends v.InferInput<typeof relationshipSchema> {}
export interface StarterPackView extends v.InferInput<typeof starterPackViewSchema> {}
export interface StarterPackViewBasic extends v.InferInput<typeof starterPackViewBasicSchema> {}
