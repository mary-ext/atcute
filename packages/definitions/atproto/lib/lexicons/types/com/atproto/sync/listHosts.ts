import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoSyncDefs from './defs.js';

const _hostSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.sync.listHosts#host')),
	accountCount: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	/**
	 * hostname of server; not a URL (no scheme)
	 */
	hostname: /*#__PURE__*/ v.string(),
	/**
	 * Recent repo stream event sequence number. May be delayed from actual stream processing (eg, persisted cursor not in-memory cursor).
	 */
	seq: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	get status() {
		return /*#__PURE__*/ v.optional(ComAtprotoSyncDefs.hostStatusSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.listHosts', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * @minimum 1
		 * @maximum 1000
		 * @default 200
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 1000)]),
			200,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * Sort order is not formally specified. Recommended order is by time host was first seen by the server, with oldest first.
			 */
			get hosts() {
				return /*#__PURE__*/ v.array(hostSchema);
			},
		}),
	},
});

type host$schematype = typeof _hostSchema;
type main$schematype = typeof _mainSchema;

export interface hostSchema extends host$schematype {}
export interface mainSchema extends main$schematype {}

export const hostSchema = _hostSchema as hostSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Host extends v.InferInput<typeof hostSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.listHosts': mainSchema;
	}
}
