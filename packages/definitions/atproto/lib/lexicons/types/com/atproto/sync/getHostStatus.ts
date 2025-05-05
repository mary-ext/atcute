import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoSyncDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.getHostStatus', {
	params: /*#__PURE__*/ v.object({
		hostname: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			hostname: /*#__PURE__*/ v.string(),
			seq: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			accountCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			get status() {
				return /*#__PURE__*/ v.optional(ComAtprotoSyncDefs.hostStatusSchema);
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getHostStatus': mainSchema.$schema;
	}
}
