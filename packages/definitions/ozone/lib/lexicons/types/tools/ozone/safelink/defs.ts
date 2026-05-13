import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _actionTypeSchema = /*#__PURE__*/ v.string<'block' | 'warn' | 'whitelist' | (string & {})>();
const _eventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.safelink.defs#event')),
	get action() {
		return actionTypeSchema;
	},
	/** Optional comment about the decision */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of the user who created this rule */
	createdBy: /*#__PURE__*/ v.didString(),
	get eventType() {
		return eventTypeSchema;
	},
	/** Auto-incrementing row ID */
	id: /*#__PURE__*/ v.integer(),
	get pattern() {
		return patternTypeSchema;
	},
	get reason() {
		return reasonTypeSchema;
	},
	/** The URL that this rule applies to */
	url: /*#__PURE__*/ v.string(),
});
const _eventTypeSchema = /*#__PURE__*/ v.string<'addRule' | 'removeRule' | 'updateRule' | (string & {})>();
const _patternTypeSchema = /*#__PURE__*/ v.string<'domain' | 'url' | (string & {})>();
const _reasonTypeSchema = /*#__PURE__*/ v.string<'csam' | 'none' | 'phishing' | 'spam' | (string & {})>();
const _urlRuleSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.safelink.defs#urlRule')),
	get action() {
		return actionTypeSchema;
	},
	/** Optional comment about the decision */
	comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Timestamp when the rule was created */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** DID of the user added the rule. */
	createdBy: /*#__PURE__*/ v.didString(),
	get pattern() {
		return patternTypeSchema;
	},
	get reason() {
		return reasonTypeSchema;
	},
	/** Timestamp when the rule was last updated */
	updatedAt: /*#__PURE__*/ v.datetimeString(),
	/** The URL or domain to apply the rule to */
	url: /*#__PURE__*/ v.string(),
});

type actionType$schematype = typeof _actionTypeSchema;
type event$schematype = typeof _eventSchema;
type eventType$schematype = typeof _eventTypeSchema;
type patternType$schematype = typeof _patternTypeSchema;
type reasonType$schematype = typeof _reasonTypeSchema;
type urlRule$schematype = typeof _urlRuleSchema;

export interface actionTypeSchema extends actionType$schematype {}
export interface eventSchema extends event$schematype {}
export interface eventTypeSchema extends eventType$schematype {}
export interface patternTypeSchema extends patternType$schematype {}
export interface reasonTypeSchema extends reasonType$schematype {}
export interface urlRuleSchema extends urlRule$schematype {}

export const actionTypeSchema = _actionTypeSchema as actionTypeSchema;
export const eventSchema = _eventSchema as eventSchema;
export const eventTypeSchema = _eventTypeSchema as eventTypeSchema;
export const patternTypeSchema = _patternTypeSchema as patternTypeSchema;
export const reasonTypeSchema = _reasonTypeSchema as reasonTypeSchema;
export const urlRuleSchema = _urlRuleSchema as urlRuleSchema;

export type ActionType = v.InferInput<typeof actionTypeSchema>;
export interface Event extends v.InferInput<typeof eventSchema> {}
export type EventType = v.InferInput<typeof eventTypeSchema>;
export type PatternType = v.InferInput<typeof patternTypeSchema>;
export type ReasonType = v.InferInput<typeof reasonTypeSchema>;
export interface UrlRule extends v.InferInput<typeof urlRuleSchema> {}
