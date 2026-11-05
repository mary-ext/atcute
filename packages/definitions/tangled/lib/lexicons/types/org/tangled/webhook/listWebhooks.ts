import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledWebhookDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.webhook.listWebhooks', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository as minted by the knot. */
		repo: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get webhooks() {
				return /*#__PURE__*/ v.array(OrgTangledWebhookDefs.webhookSchema);
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
		'org.tangled.webhook.listWebhooks': mainSchema;
	}
}
