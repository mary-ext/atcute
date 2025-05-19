import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoModerationDefs from '@atcute/atproto/types/moderation/defs';

const _labelerPoliciesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerPolicies')),
	get labelValues() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelValueSchema);
	},
	get labelValueDefinitions() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelValueDefinitionSchema));
	},
});
const _labelerViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerView')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.cidString(),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get viewer() {
		return /*#__PURE__*/ v.optional(labelerViewerStateSchema);
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
});
const _labelerViewDetailedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerViewDetailed')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.cidString(),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	get policies() {
		return labelerPoliciesSchema;
	},
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get viewer() {
		return /*#__PURE__*/ v.optional(labelerViewerStateSchema);
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	get reasonTypes() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.reasonTypeSchema));
	},
	get subjectTypes() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.subjectTypeSchema));
	},
	subjectCollections: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString())),
});
const _labelerViewerStateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerViewerState')),
	like: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});

type labelerPolicies$schematype = typeof _labelerPoliciesSchema;
type labelerView$schematype = typeof _labelerViewSchema;
type labelerViewDetailed$schematype = typeof _labelerViewDetailedSchema;
type labelerViewerState$schematype = typeof _labelerViewerStateSchema;

export interface labelerPoliciesSchema extends labelerPolicies$schematype {}
export interface labelerViewSchema extends labelerView$schematype {}
export interface labelerViewDetailedSchema extends labelerViewDetailed$schematype {}
export interface labelerViewerStateSchema extends labelerViewerState$schematype {}

export const labelerPoliciesSchema = _labelerPoliciesSchema as labelerPoliciesSchema;
export const labelerViewSchema = _labelerViewSchema as labelerViewSchema;
export const labelerViewDetailedSchema = _labelerViewDetailedSchema as labelerViewDetailedSchema;
export const labelerViewerStateSchema = _labelerViewerStateSchema as labelerViewerStateSchema;

export interface LabelerPolicies extends v.InferInput<typeof labelerPoliciesSchema> {}
export interface LabelerView extends v.InferInput<typeof labelerViewSchema> {}
export interface LabelerViewDetailed extends v.InferInput<typeof labelerViewDetailedSchema> {}
export interface LabelerViewerState extends v.InferInput<typeof labelerViewerStateSchema> {}
