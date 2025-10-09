import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

const _createSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#create')),
	collection: /*#__PURE__*/ v.nsidString(),
	/**
	 * NOTE: maxLength is redundant with record-key format. Keeping it temporarily to ensure backwards compatibility.
	 * @maxLength 512
	 */
	rkey: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.recordKeyString(), [/*#__PURE__*/ v.stringLength(0, 512)]),
	),
	value: /*#__PURE__*/ v.unknown(),
});
const _createResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#createResult')),
	cid: /*#__PURE__*/ v.cidString(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	validationStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'unknown' | 'valid' | (string & {})>()),
});
const _deleteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#delete')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});
const _deleteResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#deleteResult')),
});
const _mainSchema = /*#__PURE__*/ v.procedure('com.atproto.repo.applyWrites', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The handle or DID of the repo (aka, current account).
			 */
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			/**
			 * If provided, the entire operation will fail if the current repo commit CID does not match this value. Used to prevent conflicting repo mutations.
			 */
			swapCommit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			/**
			 * Can be set to 'false' to skip Lexicon schema validation of record data across all operations, 'true' to require it, or leave unset to validate only for known Lexicons.
			 */
			validate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			get writes() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([createSchema, deleteSchema, updateSchema], true),
				);
			},
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get commit() {
				return /*#__PURE__*/ v.optional(ComAtprotoRepoDefs.commitMetaSchema);
			},
			get results() {
				return /*#__PURE__*/ v.optional(
					/*#__PURE__*/ v.array(
						/*#__PURE__*/ v.variant([createResultSchema, deleteResultSchema, updateResultSchema], true),
					),
				);
			},
		}),
	},
});
const _updateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#update')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
	value: /*#__PURE__*/ v.unknown(),
});
const _updateResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#updateResult')),
	cid: /*#__PURE__*/ v.cidString(),
	uri: /*#__PURE__*/ v.resourceUriString(),
	validationStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'unknown' | 'valid' | (string & {})>()),
});

type create$schematype = typeof _createSchema;
type createResult$schematype = typeof _createResultSchema;
type delete$schematype = typeof _deleteSchema;
type deleteResult$schematype = typeof _deleteResultSchema;
type main$schematype = typeof _mainSchema;
type update$schematype = typeof _updateSchema;
type updateResult$schematype = typeof _updateResultSchema;

export interface createSchema extends create$schematype {}
export interface createResultSchema extends createResult$schematype {}
export interface deleteSchema extends delete$schematype {}
export interface deleteResultSchema extends deleteResult$schematype {}
export interface mainSchema extends main$schematype {}
export interface updateSchema extends update$schematype {}
export interface updateResultSchema extends updateResult$schematype {}

export const createSchema = _createSchema as createSchema;
export const createResultSchema = _createResultSchema as createResultSchema;
export const deleteSchema = _deleteSchema as deleteSchema;
export const deleteResultSchema = _deleteResultSchema as deleteResultSchema;
export const mainSchema = _mainSchema as mainSchema;
export const updateSchema = _updateSchema as updateSchema;
export const updateResultSchema = _updateResultSchema as updateResultSchema;

export interface Create extends v.InferInput<typeof createSchema> {}
export interface CreateResult extends v.InferInput<typeof createResultSchema> {}
export interface Delete extends v.InferInput<typeof deleteSchema> {}
export interface DeleteResult extends v.InferInput<typeof deleteResultSchema> {}
export interface Update extends v.InferInput<typeof updateSchema> {}
export interface UpdateResult extends v.InferInput<typeof updateResultSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.applyWrites': mainSchema;
	}
}
