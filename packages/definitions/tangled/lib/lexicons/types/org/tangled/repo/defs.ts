import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledActorDefs from '../actor/defs.ts';

const _languageSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.defs#language')),
	name: /*#__PURE__*/ v.string(),
	/** Total size of files in this language, in bytes. */
	size: /*#__PURE__*/ v.integer(),
});
const _repoViewBasicSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.defs#repoViewBasic')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	description: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	did: /*#__PURE__*/ v.didString(),
	forkCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	isStarred: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	openIssueCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	openPullCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get owner() {
		return OrgTangledActorDefs.profileViewBasicSchema;
	},
	/** Largest language on the default branch, by bytes. */
	primaryLanguage: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	slug: /*#__PURE__*/ v.string(),
	starCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerStateSchema);
	},
});
const _sourceExternalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.defs#sourceExternal')),
	/** git-clone uri of the repo */
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _sourceTangledSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.defs#sourceTangled')),
	/** DID of the repo identity */
	did: /*#__PURE__*/ v.didString(),
});
const _viewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.repo.defs#viewerState')),
	fork: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	star: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});

type language$schematype = typeof _languageSchema;
type repoViewBasic$schematype = typeof _repoViewBasicSchema;
type sourceExternal$schematype = typeof _sourceExternalSchema;
type sourceTangled$schematype = typeof _sourceTangledSchema;
type viewerState$schematype = typeof _viewerStateSchema;

export interface languageSchema extends language$schematype {}
export interface repoViewBasicSchema extends repoViewBasic$schematype {}
export interface sourceExternalSchema extends sourceExternal$schematype {}
export interface sourceTangledSchema extends sourceTangled$schematype {}
export interface viewerStateSchema extends viewerState$schematype {}

export const languageSchema = _languageSchema as languageSchema;
export const repoViewBasicSchema = _repoViewBasicSchema as repoViewBasicSchema;
export const sourceExternalSchema = _sourceExternalSchema as sourceExternalSchema;
export const sourceTangledSchema = _sourceTangledSchema as sourceTangledSchema;
export const viewerStateSchema = _viewerStateSchema as viewerStateSchema;

export interface Language extends v.InferInput<typeof languageSchema> {}
export interface RepoViewBasic extends v.InferInput<typeof repoViewBasicSchema> {}
export interface SourceExternal extends v.InferInput<typeof sourceExternalSchema> {}
export interface SourceTangled extends v.InferInput<typeof sourceTangledSchema> {}
export interface ViewerState extends v.InferInput<typeof viewerStateSchema> {}
