import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoSyncDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.getHostStatus', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Hostname of the host (eg, PDS or relay) being queried.
		 */
		hostname: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Number of accounts on the server which are associated with the upstream host. Note that the upstream may actually have more accounts.
			 */
			accountCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			hostname: /*#__PURE__*/ v.string(),
			/**
			 * Recent repo stream event sequence number. May be delayed from actual stream processing (eg, persisted cursor not in-memory cursor).
			 */
			seq: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			get status() {
				return /*#__PURE__*/ v.optional(ComAtprotoSyncDefs.hostStatusSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getHostStatus': mainSchema;
	}
}
