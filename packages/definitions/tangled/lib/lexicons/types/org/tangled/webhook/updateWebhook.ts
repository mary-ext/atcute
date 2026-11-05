import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledWebhookDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.webhook.updateWebhook', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			get events() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(OrgTangledWebhookDefs.eventTypeSchema));
			},
			/** DID of the repository as minted by the knot. */
			repo: /*#__PURE__*/ v.didString(),
			secret: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
			/** Webhook ID to update. */
			webhook: /*#__PURE__*/ v.string(),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.webhook.updateWebhook': mainSchema;
	}
}
