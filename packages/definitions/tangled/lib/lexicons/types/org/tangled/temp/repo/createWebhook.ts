import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.repo.createWebhook', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Whether the webhook should be active immediately. Defaults to true. */
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			/** Event types to subscribe to (e.g. 'push', 'repository:renamed'). */
			events: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
			/** DID of the repository as minted by the knot. */
			repoDid: /*#__PURE__*/ v.didString(),
			/** Optional HMAC secret used to sign payloads. If omitted, payloads are not signed. */
			secret: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/** Endpoint URL that will receive webhook payloads. */
			url: /*#__PURE__*/ v.genericUriString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** ID of the newly created webhook. */
			id: /*#__PURE__*/ v.integer(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.repo.createWebhook': mainSchema;
	}
}
