import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledWebhookDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.webhook.listWebhookDeliveries', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** DID of the repository as minted by the knot. */
		repo: /*#__PURE__*/ v.didString(),
		/**
		 * @minLength 1
		 * @maxLength 50
		 */
		webhooks: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string()), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get deliveries() {
				return /*#__PURE__*/ v.array(OrgTangledWebhookDefs.deliverySchema);
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
		'org.tangled.webhook.listWebhookDeliveries': mainSchema;
	}
}
