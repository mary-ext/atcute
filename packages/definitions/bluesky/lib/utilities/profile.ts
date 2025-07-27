import type { AppBskyActorDefs, ChatBskyActorDefs } from '../lexicons/index.js';

/**
 * a union type of all possible profile views.
 */
export type AnyProfileView =
	| AppBskyActorDefs.ProfileViewBasic
	| AppBskyActorDefs.ProfileView
	| AppBskyActorDefs.ProfileViewDetailed
	| ChatBskyActorDefs.ProfileViewBasic;
