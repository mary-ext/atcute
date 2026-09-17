import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _deliverySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('org.tangled.temp.webhook.getDeliveriesForWebhooks#delivery'),
	),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** UUID for tracking this delivery attempt. */
	deliveryId: /*#__PURE__*/ v.string(),
	/** Event type that triggered the delivery. */
	event: /*#__PURE__*/ v.string(),
	id: /*#__PURE__*/ v.integer(),
	requestBody: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	responseBody: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	responseCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	success: /*#__PURE__*/ v.boolean(),
	url: /*#__PURE__*/ v.genericUriString(),
	webhookId: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.webhook.getDeliveriesForWebhooks', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minLength 1
		 * @maxLength 50
		 */
		ids: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.integer()), [
			/*#__PURE__*/ v.arrayLength(1, 50),
		]),
		/**
		 * @default 5
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			5,
		),
		/** DID of the repository as minted by the knot. */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get deliveries() {
				return /*#__PURE__*/ v.array(deliverySchema);
			},
		}),
	},
});

type delivery$schematype = typeof _deliverySchema;
type main$schematype = typeof _mainSchema;

export interface deliverySchema extends delivery$schematype {}
export interface mainSchema extends main$schematype {}

export const deliverySchema = _deliverySchema as deliverySchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Delivery extends v.InferInput<typeof deliverySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.webhook.getDeliveriesForWebhooks': mainSchema;
	}
}
