import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.repo.listWebhooks', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository as minted by the knot. */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get webhooks() {
				return /*#__PURE__*/ v.array(webhookSchema);
			},
		}),
	},
});
const _webhookSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.repo.listWebhooks#webhook')),
	/** Whether the webhook is currently enabled. */
	active: /*#__PURE__*/ v.boolean(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Event types this webhook is subscribed to (e.g. 'push', 'repository:renamed'). */
	events: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	/** Webhook identifier. */
	id: /*#__PURE__*/ v.integer(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Endpoint URL that receives webhook payloads. */
	url: /*#__PURE__*/ v.genericUriString(),
});

type main$schematype = typeof _mainSchema;
type webhook$schematype = typeof _webhookSchema;

export interface mainSchema extends main$schematype {}
export interface webhookSchema extends webhook$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const webhookSchema = _webhookSchema as webhookSchema;

export interface Webhook extends v.InferInput<typeof webhookSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.repo.listWebhooks': mainSchema;
	}
}
