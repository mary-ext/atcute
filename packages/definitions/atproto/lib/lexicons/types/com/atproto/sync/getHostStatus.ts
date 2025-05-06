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

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getHostStatus': main$schema;
	}
}
