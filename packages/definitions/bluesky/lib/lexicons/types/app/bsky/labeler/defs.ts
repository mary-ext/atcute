import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import * as AppBskyActorDefs from '../actor/defs.js';
import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import * as ComAtprotoModerationDefs from '@atcute/atproto/types/moderation/defs';

const _labelerPoliciesSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerPolicies')),
	/**
	 * Label values created by this labeler and scoped exclusively to it. Labels defined here will override global label definitions for this labeler.
	 */
	get labelValueDefinitions() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelValueDefinitionSchema));
	},
	/**
	 * The label values which this labeler publishes. May include global or custom labels.
	 */
	get labelValues() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelValueSchema);
	},
});
const _labelerViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerView')),
	cid: /*#__PURE__*/ v.cidString(),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minimum 0
	 */
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(labelerViewerStateSchema);
	},
});
const _labelerViewDetailedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.labeler.defs#labelerViewDetailed')),
	cid: /*#__PURE__*/ v.cidString(),
	get creator() {
		return AppBskyActorDefs.profileViewSchema;
	},
	indexedAt: /*#__PURE__*/ v.datetimeString(),
	get labels() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema));
	},
	/**
	 * @minimum 0
	 */
	likeCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get policies() {
		return labelerPoliciesSchema;
	},
	/**
	 * The set of report reason 'codes' which are in-scope for this service to review and action. These usually align to policy categories. If not defined (distinct from empty array), all reason types are allowed.
	 */
	get reasonTypes() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.reasonTypeSchema));
	},
	/**
	 * Set of record types (collection NSIDs) which can be reported to this service. If not defined (distinct from empty array), default is any record type.
	 */
	subjectCollections: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString())),
	/**
	 * The set of subject types (account, record, etc) this service accepts reports on.
	 */
	get subjectTypes() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoModerationDefs.subjectTypeSchema));
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
	get viewer() {
		return /*#__PURE__*/ v.optional(labelerViewerStateSchema);
	},
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
