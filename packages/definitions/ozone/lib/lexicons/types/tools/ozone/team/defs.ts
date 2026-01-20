import * as AppBskyActorDefs from '@atcute/bluesky/types/app/actor/defs';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _memberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.team.defs#member')),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	did: /*#__PURE__*/ v.didString(),
	disabled: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	lastUpdatedBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	get profile() {
		return /*#__PURE__*/ v.optional(AppBskyActorDefs.profileViewDetailedSchema);
	},
	role: /*#__PURE__*/ v.string<
		| 'tools.ozone.team.defs#roleAdmin'
		| 'tools.ozone.team.defs#roleModerator'
		| 'tools.ozone.team.defs#roleTriage'
		| 'tools.ozone.team.defs#roleVerifier'
		| (string & {})
	>(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _roleAdminSchema = /*#__PURE__*/ v.literal('tools.ozone.team.defs#roleAdmin');
const _roleModeratorSchema = /*#__PURE__*/ v.literal('tools.ozone.team.defs#roleModerator');
const _roleTriageSchema = /*#__PURE__*/ v.literal('tools.ozone.team.defs#roleTriage');
const _roleVerifierSchema = /*#__PURE__*/ v.literal('tools.ozone.team.defs#roleVerifier');

type member$schematype = typeof _memberSchema;
type roleAdmin$schematype = typeof _roleAdminSchema;
type roleModerator$schematype = typeof _roleModeratorSchema;
type roleTriage$schematype = typeof _roleTriageSchema;
type roleVerifier$schematype = typeof _roleVerifierSchema;

export interface memberSchema extends member$schematype {}
export interface roleAdminSchema extends roleAdmin$schematype {}
export interface roleModeratorSchema extends roleModerator$schematype {}
export interface roleTriageSchema extends roleTriage$schematype {}
export interface roleVerifierSchema extends roleVerifier$schematype {}

export const memberSchema = _memberSchema as memberSchema;
export const roleAdminSchema = _roleAdminSchema as roleAdminSchema;
export const roleModeratorSchema = _roleModeratorSchema as roleModeratorSchema;
export const roleTriageSchema = _roleTriageSchema as roleTriageSchema;
export const roleVerifierSchema = _roleVerifierSchema as roleVerifierSchema;

export interface Member extends v.InferInput<typeof memberSchema> {}
export type RoleAdmin = v.InferInput<typeof roleAdminSchema>;
export type RoleModerator = v.InferInput<typeof roleModeratorSchema>;
export type RoleTriage = v.InferInput<typeof roleTriageSchema>;
export type RoleVerifier = v.InferInput<typeof roleVerifierSchema>;
