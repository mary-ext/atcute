import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoRepoDefs from './defs.js';

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
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

const _createSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#create')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.recordKeyString(), [/*#__PURE__*/ v.stringLength(0, 512)]),
	),
	value: /*#__PURE__*/ v.unknown(),
});
export const createSchema = _createSchema as createSchema.$schema;
export interface Create extends v.InferInput<typeof createSchema> {}
export declare namespace createSchema {
	export {};
	type $schematype = typeof _createSchema;
	export interface $schema extends $schematype {}
}

const _updateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#update')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
	value: /*#__PURE__*/ v.unknown(),
});
export const updateSchema = _updateSchema as updateSchema.$schema;
export interface Update extends v.InferInput<typeof updateSchema> {}
export declare namespace updateSchema {
	export {};
	type $schematype = typeof _updateSchema;
	export interface $schema extends $schematype {}
}

const _deleteSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#delete')),
	collection: /*#__PURE__*/ v.nsidString(),
	rkey: /*#__PURE__*/ v.recordKeyString(),
});
export const deleteSchema = _deleteSchema as deleteSchema.$schema;
export interface Delete extends v.InferInput<typeof deleteSchema> {}
export declare namespace deleteSchema {
	export {};
	type $schematype = typeof _deleteSchema;
	export interface $schema extends $schematype {}
}

const _createResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#createResult')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	validationStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'valid' | 'unknown' | (string & {})>()),
});
export const createResultSchema = _createResultSchema as createResultSchema.$schema;
export interface CreateResult extends v.InferInput<typeof createResultSchema> {}
export declare namespace createResultSchema {
	export {};
	type $schematype = typeof _createResultSchema;
	export interface $schema extends $schematype {}
}

const _updateResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#updateResult')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	validationStatus: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'valid' | 'unknown' | (string & {})>()),
});
export const updateResultSchema = _updateResultSchema as updateResultSchema.$schema;
export interface UpdateResult extends v.InferInput<typeof updateResultSchema> {}
export declare namespace updateResultSchema {
	export {};
	type $schematype = typeof _updateResultSchema;
	export interface $schema extends $schematype {}
}

const _deleteResultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.applyWrites#deleteResult')),
});
export const deleteResultSchema = _deleteResultSchema as deleteResultSchema.$schema;
export interface DeleteResult extends v.InferInput<typeof deleteResultSchema> {}
export declare namespace deleteResultSchema {
	export {};
	type $schematype = typeof _deleteResultSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.repo.applyWrites': mainSchema.$schema;
	}
}
