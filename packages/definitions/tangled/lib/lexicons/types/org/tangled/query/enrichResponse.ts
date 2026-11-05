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

type labels$schematype = typeof _labelsSchema;
type linkDescriptor$schematype = typeof _linkDescriptorSchema;
type main$schematype = typeof _mainSchema;

export interface labelsSchema extends labels$schematype {}
export interface linkDescriptorSchema extends linkDescriptor$schematype {}
export interface mainSchema extends main$schematype {}

export const labelsSchema = _labelsSchema as labelsSchema;
export const linkDescriptorSchema = _linkDescriptorSchema as linkDescriptorSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Labels extends v.InferInput<typeof labelsSchema> {}
export interface LinkDescriptor extends v.InferInput<typeof linkDescriptorSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.query.enrichResponse': mainSchema;
	}
}
