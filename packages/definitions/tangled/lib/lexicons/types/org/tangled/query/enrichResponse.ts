import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _labelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.query.enrichResponse#labels')),
	get labels() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
	},
});
const _linkDescriptorSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.query.enrichResponse#linkDescriptor')),
	/**
	 * Collection whose records are linked, a colon, then an index-backed path (subject or .repo), or . for the
	 * record the reference names, which hydrates into that collection's view.
	 */
	source: /*#__PURE__*/ v.string(),
	/**
	 * Record paths into the inner response selecting references for this payload. A path can end in an
	 * envelope: path:.repo for a ref's author, path:.rkey for the did its rkey names, path:. for the ref
	 * itself. All references are considered when omitted.
	 */
	targets: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	/**
	 * NSID of the payload type to produce, which also defines the payload's shape. Results land at
	 * data[ref][source][type].
	 */
	type: /*#__PURE__*/ v.string<
		| 'blue.microcosm.identity.resolveMiniDoc'
		| 'org.tangled.query.enrichResponse#count'
		| 'org.tangled.query.enrichResponse#distinctAuthors'
		| 'org.tangled.query.enrichResponse#labels'
		| 'org.tangled.query.enrichResponse#reactions'
		| 'org.tangled.query.enrichResponse#viewer'
		| 'org.tangled.repo.defs#repoViewBasic'
		| (string & {})
	>(),
});
const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.query.enrichResponse', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Payloads to compute for each found reference. */
			get enrich() {
				return /*#__PURE__*/ v.array(linkDescriptorSchema);
			},
			/** Parameters for the inner query, exactly as it declares them. */
			params: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.unknown()),
			/**
			 * DID whose own relation to each reference is looked up for viewer payloads and views. Required when
			 * any descriptor requests a viewer payload.
			 */
			viewer: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/** NSID of the inner query to run, e.g. org.tangled.repo.listRepos. */
			xrpc: /*#__PURE__*/ v.nsidString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Reference (did or at-uri) -> link source -> payload type nsid -> payload. References no descriptor
			 * applies to are absent.
			 */
			data: /*#__PURE__*/ v.unknown(),
			/** The inner query's response, unmodified. */
			output: /*#__PURE__*/ v.unknown(),
		}),
	},
});
const _reactionSummarySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.query.enrichResponse#reactionSummary'),
	),
	/** @minimum 1 */
	count: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1)]),
	/** @maxGraphemes 1 */
	reaction: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(0, 1)]),
	/**
	 * The newest few who reacted with this emoji, at most 10.
	 *
	 * @maxLength 10
	 */
	reactors: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
		/*#__PURE__*/ v.arrayLength(0, 10),
	]),
	/** The viewer's own reaction with this emoji, when a viewer was given and has one. */
	get viewer() {
		return /*#__PURE__*/ v.optional(viewerReactionSchema);
	},
});
const _reactionsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.query.enrichResponse#reactions')),
	get reactions() {
		return /*#__PURE__*/ v.array(reactionSummarySchema);
	},
});
const _viewerReactionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.query.enrichResponse#viewerReaction')),
	/** Absent when the record couldn't be fetched. */
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type labels$schematype = typeof _labelsSchema;
type linkDescriptor$schematype = typeof _linkDescriptorSchema;
type main$schematype = typeof _mainSchema;
type reactionSummary$schematype = typeof _reactionSummarySchema;
type reactions$schematype = typeof _reactionsSchema;
type viewerReaction$schematype = typeof _viewerReactionSchema;

export interface labelsSchema extends labels$schematype {}
export interface linkDescriptorSchema extends linkDescriptor$schematype {}
export interface mainSchema extends main$schematype {}
export interface reactionSummarySchema extends reactionSummary$schematype {}
export interface reactionsSchema extends reactions$schematype {}
export interface viewerReactionSchema extends viewerReaction$schematype {}

export const labelsSchema = _labelsSchema as labelsSchema;
export const linkDescriptorSchema = _linkDescriptorSchema as linkDescriptorSchema;
export const mainSchema = _mainSchema as mainSchema;
export const reactionSummarySchema = _reactionSummarySchema as reactionSummarySchema;
export const reactionsSchema = _reactionsSchema as reactionsSchema;
export const viewerReactionSchema = _viewerReactionSchema as viewerReactionSchema;

export interface Labels extends v.InferInput<typeof labelsSchema> {}
export interface LinkDescriptor extends v.InferInput<typeof linkDescriptorSchema> {}
export interface ReactionSummary extends v.InferInput<typeof reactionSummarySchema> {}
export interface Reactions extends v.InferInput<typeof reactionsSchema> {}
export interface ViewerReaction extends v.InferInput<typeof viewerReactionSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.query.enrichResponse': mainSchema;
	}
}
