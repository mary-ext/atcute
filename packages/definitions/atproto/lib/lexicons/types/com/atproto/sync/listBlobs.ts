import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.listBlobs', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.tidString()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.pipe(/*#__PURE__*/ v.integer(), /*#__PURE__*/ v.integerRange(1, 1000)),
			500,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			cids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
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
		'com.atproto.sync.listBlobs': mainSchema.$schema;
	}
}
