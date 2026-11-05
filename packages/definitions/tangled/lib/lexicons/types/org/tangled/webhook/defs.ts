import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _deliverySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.webhook.defs#delivery')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Event type that triggered the delivery. */
	get event() {
		return eventTypeSchema;
	},
	/** Unique ID for tracking this delivery attempt. */
	id: /*#__PURE__*/ v.string(),
	requestBody: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
	responseBody: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
	responseCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	success: /*#__PURE__*/ v.boolean(),
	url: /*#__PURE__*/ v.genericUriString(),
	/** ID of the webhook this delivery belongs to. */
	webhook: /*#__PURE__*/ v.string(),
});
const _eventTypeSchema = /*#__PURE__*/ v.string<
	| 'org.tangled.event.pullRequest'
	| 'pull_request:closed'
	| 'pull_request:created'
	| 'pull_request:merged'
	| 'pull_request:reopened'
	| 'pull_request:resubmitted'
	| 'push'
	| 'repository:renamed'
	| (string & {})
>();
const _webhookSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.webhook.defs#webhook')),
	/** Whether the webhook is currently enabled. */
	active: /*#__PURE__*/ v.boolean(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Event types this webhook is subscribed to. */
	get events() {
		return /*#__PURE__*/ v.array(eventTypeSchema);
	},
	/** Webhook identifier. */
	id: /*#__PURE__*/ v.string(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/** Endpoint URL that receives webhook payloads. */
	url: /*#__PURE__*/ v.genericUriString(),
});

type delivery$schematype = typeof _deliverySchema;
type eventType$schematype = typeof _eventTypeSchema;
type webhook$schematype = typeof _webhookSchema;

export interface deliverySchema extends delivery$schematype {}
export interface eventTypeSchema extends eventType$schematype {}
export interface webhookSchema extends webhook$schematype {}

export const deliverySchema = _deliverySchema as deliverySchema;
export const eventTypeSchema = _eventTypeSchema as eventTypeSchema;
export const webhookSchema = _webhookSchema as webhookSchema;

export interface Delivery extends v.InferInput<typeof deliverySchema> {}
export type EventType = v.InferInput<typeof eventTypeSchema>;
export interface Webhook extends v.InferInput<typeof webhookSchema> {}
