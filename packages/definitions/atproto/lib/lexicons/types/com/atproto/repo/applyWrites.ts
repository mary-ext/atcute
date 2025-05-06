import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

const _createSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#create')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.recordKeyString(), [/*#__PURE__*/ v.stringLength(0, 512)]),
	),
	value: /*#__PURE__*/ v.unknown(),
});
const _createResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#createResult')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	validationStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'valid' | 'unknown' | (string & {})>()),
});
const _deleteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#delete')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});
const _deleteResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#deleteResult')),
});
const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.repo.applyWrites', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			repo: /*#__PURE__*/ v.actorIdentifierString(),
			validate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			get writes() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([createSchema, updateSchema, deleteSchema], true),
				);
			},
			swapCommit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
						/*#__PURE__*/ v.variant([createResultSchema, updateResultSchema, deleteResultSchema], true),
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
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	validationStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'valid' | 'unknown' | (string & {})>()),
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.applyWrites': mainSchema;
	}
}
