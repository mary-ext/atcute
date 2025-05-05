import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.getBlob', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
		cid: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'blob',
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
		'com.atproto.sync.getBlob': mainSchema.$schema;
	}
}
