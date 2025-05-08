import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../../../app/bsky/actor/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';

const _profileViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.actor.defs#profileViewBasic')),
	did: /*#__PURE__*/ v.didString(),
	handle: /*#__PURE__*/ v.handleString(),
	displayName: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 640),
			/*#__PURE__*/ v.stringGraphemes(0, 64),
		]),
	),
	avatar: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	get associated() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.profileAssociatedSchema);
	},
	get viewer() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.viewerStateSchema);
	},
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	chatDisabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get verification() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.verificationStateSchema);
	},
});

type profileViewBasic$schematype = typeof _profileViewBasicSchema;

export interface profileViewBasicSchema extends profileViewBasic$schematype {}

export const profileViewBasicSchema = _profileViewBasicSchema as profileViewBasicSchema;

export interface ProfileViewBasic extends v.InferInput<typeof profileViewBasicSchema> {}
