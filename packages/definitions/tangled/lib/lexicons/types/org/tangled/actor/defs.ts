import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _profileViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.actor.defs#profileViewBasic')),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	/**
	 * The cid of the avatar blob in the account's profile record. Absent when the record has no avatar or
	 * bobbin couldn't read it.
	 */
	avatarCid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
});
const _profileViewDetailedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.actor.defs#profileViewDetailed')),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	/**
	 * The cid of the avatar blob in the account's profile record. Absent when the record has no avatar or
	 * bobbin couldn't read it.
	 */
	avatarCid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	did: /*#__PURE__*/ v.didString(),
	followersCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	followsCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	handle: /*#__PURE__*/ v.handleString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
});
const _viewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.actor.defs#viewerState')),
	followedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	following: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});

type profileViewBasic$schematype = typeof _profileViewBasicSchema;
type profileViewDetailed$schematype = typeof _profileViewDetailedSchema;
type viewerState$schematype = typeof _viewerStateSchema;

export interface profileViewBasicSchema extends profileViewBasic$schematype {}
export interface profileViewDetailedSchema extends profileViewDetailed$schematype {}
export interface viewerStateSchema extends viewerState$schematype {}

export const profileViewBasicSchema = _profileViewBasicSchema as profileViewBasicSchema;
export const profileViewDetailedSchema = _profileViewDetailedSchema as profileViewDetailedSchema;
export const viewerStateSchema = _viewerStateSchema as viewerStateSchema;

export interface ProfileViewBasic extends v.InferInput<typeof profileViewBasicSchema> {}
export interface ProfileViewDetailed extends v.InferInput<typeof profileViewDetailedSchema> {}
export interface ViewerState extends v.InferInput<typeof viewerStateSchema> {}
