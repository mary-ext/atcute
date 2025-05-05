import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.repo.getRecord', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		collection: /*#__PURE__*/ v.nsidString(),
		rkey: /*#__PURE__*/ v.recordKeyString(),
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			uri: /*#__PURE__*/ v.resourceUriString(),
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			value: /*#__PURE__*/ v.unknown(),
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.getRecord': mainSchema.$schema;
	}
}
