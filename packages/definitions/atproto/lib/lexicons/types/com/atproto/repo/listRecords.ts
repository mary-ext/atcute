import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.repo.listRecords', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		collection: /*#__PURE__*/ v.nsidString(),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.pipe(/*#__PURE__*/ v.integer(), /*#__PURE__*/ v.integerRange(1, 100)),
			50,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		reverse: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get records() {
				return /*#__PURE__*/ v.array(recordSchema);
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

const _recordSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.repo.listRecords#record')),
	uri: /*#__PURE__*/ v.resourceUriString(),
	cid: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.unknown(),
});
export const recordSchema = _recordSchema as recordSchema.$schema;
export interface Record extends v.InferInput<typeof recordSchema> {}
export declare namespace recordSchema {
	export {};
	type $schematype = typeof _recordSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.listRecords': mainSchema.$schema;
	}
}
