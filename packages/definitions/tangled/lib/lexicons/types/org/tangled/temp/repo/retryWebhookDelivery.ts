import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.repo.retryWebhookDelivery', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** UUID of the delivery to retry. */
			deliveryId: /*#__PURE__*/ v.string(),
			/** DID of the repository as minted by the knot. */
			repoDid: /*#__PURE__*/ v.didString(),
			/** Webhook ID that owns the delivery. */
			webhookId: /*#__PURE__*/ v.integer(),
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
		'org.tangled.temp.repo.retryWebhookDelivery': mainSchema;
	}
}
