import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledWebhookDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.webhook.createWebhook', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Whether the webhook should be active immediately.
			 *
			 * @default true
			 */
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
			/** Event types to subscribe to. */
			get events() {
				return /*#__PURE__*/ v.array(OrgTangledWebhookDefs.eventTypeSchema);
			},
			/** DID of the repository as minted by the knot. */
			repo: /*#__PURE__*/ v.didString(),
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
			id: /*#__PURE__*/ v.string(),
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
		'org.tangled.webhook.createWebhook': mainSchema;
	}
}
