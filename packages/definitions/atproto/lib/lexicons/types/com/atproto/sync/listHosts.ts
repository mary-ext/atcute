import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoSyncDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.listHosts', {
	params: /*#__PURE__*/ v.object({
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			200,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get hosts() {
				return /*#__PURE__*/ v.array(hostSchema);
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

const _hostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.listHosts#host')),
	hostname: /*#__PURE__*/ v.string(),
	seq: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	accountCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get status() {
		return /*#__PURE__*/ v.optional(ComAtprotoSyncDefs.hostStatusSchema);
	},
});
export const hostSchema = _hostSchema as hostSchema.$schema;
export interface Host extends v.InferInput<typeof hostSchema> {}
export declare namespace hostSchema {
	export {};
	type $schematype = typeof _hostSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.listHosts': mainSchema.$schema;
	}
}
