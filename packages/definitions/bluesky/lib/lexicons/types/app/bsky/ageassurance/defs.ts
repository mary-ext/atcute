import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _accessSchema = /*#__PURE__*/ v.string<'full' | 'none' | 'safe' | 'unknown' | (string & {})>();
const _configSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#config')),
	/**
	 * The per-region Age Assurance configuration.
	 */
	get regions() {
		return /*#__PURE__*/ v.array(configRegionSchema);
	},
});
const _configRegionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegion')),
	/**
	 * The ISO 3166-1 alpha-2 country code this configuration applies to.
	 */
	countryCode: /*#__PURE__*/ v.string(),
	/**
	 * The minimum age (as a whole integer) required to use Bluesky in this region.
	 */
	minAccessAge: /*#__PURE__*/ v.integer(),
	/**
	 * The ISO 3166-2 region code this configuration applies to. If omitted, the configuration applies to the entire country.
	 */
	regionCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The ordered list of Age Assurance rules that apply to this region. Rules should be applied in order, and the first matching rule determines the access level granted. The rules array should always include a default rule as the last item.
	 */
	get rules() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([
				configRegionRuleDefaultSchema,
				configRegionRuleIfAccountNewerThanSchema,
				configRegionRuleIfAccountOlderThanSchema,
				configRegionRuleIfAssuredOverAgeSchema,
				configRegionRuleIfAssuredUnderAgeSchema,
				configRegionRuleIfDeclaredOverAgeSchema,
				configRegionRuleIfDeclaredUnderAgeSchema,
			]),
		);
	},
});
const _configRegionRuleDefaultSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleDefault'),
	),
	get access() {
		return accessSchema;
	},
});
const _configRegionRuleIfAccountNewerThanSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleIfAccountNewerThan'),
	),
	get access() {
		return accessSchema;
	},
	/**
	 * The date threshold as a datetime string.
	 */
	date: /*#__PURE__*/ v.datetimeString(),
});
const _configRegionRuleIfAccountOlderThanSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleIfAccountOlderThan'),
	),
	get access() {
		return accessSchema;
	},
	/**
	 * The date threshold as a datetime string.
	 */
	date: /*#__PURE__*/ v.datetimeString(),
});
const _configRegionRuleIfAssuredOverAgeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleIfAssuredOverAge'),
	),
	get access() {
		return accessSchema;
	},
	/**
	 * The age threshold as a whole integer.
	 */
	age: /*#__PURE__*/ v.integer(),
});
const _configRegionRuleIfAssuredUnderAgeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleIfAssuredUnderAge'),
	),
	get access() {
		return accessSchema;
	},
	/**
	 * The age threshold as a whole integer.
	 */
	age: /*#__PURE__*/ v.integer(),
});
const _configRegionRuleIfDeclaredOverAgeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleIfDeclaredOverAge'),
	),
	get access() {
		return accessSchema;
	},
	/**
	 * The age threshold as a whole integer.
	 */
	age: /*#__PURE__*/ v.integer(),
});
const _configRegionRuleIfDeclaredUnderAgeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#configRegionRuleIfDeclaredUnderAge'),
	),
	get access() {
		return accessSchema;
	},
	/**
	 * The age threshold as a whole integer.
	 */
	age: /*#__PURE__*/ v.integer(),
});
const _eventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#event')),
	/**
	 * The access level granted based on Age Assurance data we've processed.
	 */
	access: /*#__PURE__*/ v.string<'full' | 'none' | 'safe' | 'unknown' | (string & {})>(),
	/**
	 * The unique identifier for this instance of the Age Assurance flow, in UUID format.
	 */
	attemptId: /*#__PURE__*/ v.string(),
	/**
	 * The IP address used when completing the Age Assurance flow.
	 */
	completeIp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The user agent used when completing the Age Assurance flow.
	 */
	completeUa: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The ISO 3166-1 alpha-2 country code provided when beginning the Age Assurance flow.
	 */
	countryCode: /*#__PURE__*/ v.string(),
	/**
	 * The date and time of this write operation.
	 */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/**
	 * The email used for Age Assurance.
	 */
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The IP address used when initiating the Age Assurance flow.
	 */
	initIp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The user agent used when initiating the Age Assurance flow.
	 */
	initUa: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The ISO 3166-2 region code provided when beginning the Age Assurance flow.
	 */
	regionCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/**
	 * The status of the Age Assurance process.
	 */
	status: /*#__PURE__*/ v.string<'assured' | 'blocked' | 'pending' | 'unknown' | (string & {})>(),
});
const _stateSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#state')),
	get access() {
		return accessSchema;
	},
	/**
	 * The timestamp when this state was last updated.
	 */
	lastInitiatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	get status() {
		return statusSchema;
	},
});
const _stateMetadataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.ageassurance.defs#stateMetadata')),
	/**
	 * The account creation timestamp.
	 */
	accountCreatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
});
const _statusSchema = /*#__PURE__*/ v.string<'assured' | 'blocked' | 'pending' | 'unknown' | (string & {})>();

type access$schematype = typeof _accessSchema;
type config$schematype = typeof _configSchema;
type configRegion$schematype = typeof _configRegionSchema;
type configRegionRuleDefault$schematype = typeof _configRegionRuleDefaultSchema;
type configRegionRuleIfAccountNewerThan$schematype = typeof _configRegionRuleIfAccountNewerThanSchema;
type configRegionRuleIfAccountOlderThan$schematype = typeof _configRegionRuleIfAccountOlderThanSchema;
type configRegionRuleIfAssuredOverAge$schematype = typeof _configRegionRuleIfAssuredOverAgeSchema;
type configRegionRuleIfAssuredUnderAge$schematype = typeof _configRegionRuleIfAssuredUnderAgeSchema;
type configRegionRuleIfDeclaredOverAge$schematype = typeof _configRegionRuleIfDeclaredOverAgeSchema;
type configRegionRuleIfDeclaredUnderAge$schematype = typeof _configRegionRuleIfDeclaredUnderAgeSchema;
type event$schematype = typeof _eventSchema;
type state$schematype = typeof _stateSchema;
type stateMetadata$schematype = typeof _stateMetadataSchema;
type status$schematype = typeof _statusSchema;

export interface accessSchema extends access$schematype {}
export interface configSchema extends config$schematype {}
export interface configRegionSchema extends configRegion$schematype {}
export interface configRegionRuleDefaultSchema extends configRegionRuleDefault$schematype {}
export interface configRegionRuleIfAccountNewerThanSchema extends configRegionRuleIfAccountNewerThan$schematype {}
export interface configRegionRuleIfAccountOlderThanSchema extends configRegionRuleIfAccountOlderThan$schematype {}
export interface configRegionRuleIfAssuredOverAgeSchema extends configRegionRuleIfAssuredOverAge$schematype {}
export interface configRegionRuleIfAssuredUnderAgeSchema extends configRegionRuleIfAssuredUnderAge$schematype {}
export interface configRegionRuleIfDeclaredOverAgeSchema extends configRegionRuleIfDeclaredOverAge$schematype {}
export interface configRegionRuleIfDeclaredUnderAgeSchema extends configRegionRuleIfDeclaredUnderAge$schematype {}
export interface eventSchema extends event$schematype {}
export interface stateSchema extends state$schematype {}
export interface stateMetadataSchema extends stateMetadata$schematype {}
export interface statusSchema extends status$schematype {}

export const accessSchema = _accessSchema as accessSchema;
export const configSchema = _configSchema as configSchema;
export const configRegionSchema = _configRegionSchema as configRegionSchema;
export const configRegionRuleDefaultSchema = _configRegionRuleDefaultSchema as configRegionRuleDefaultSchema;
export const configRegionRuleIfAccountNewerThanSchema =
	_configRegionRuleIfAccountNewerThanSchema as configRegionRuleIfAccountNewerThanSchema;
export const configRegionRuleIfAccountOlderThanSchema =
	_configRegionRuleIfAccountOlderThanSchema as configRegionRuleIfAccountOlderThanSchema;
export const configRegionRuleIfAssuredOverAgeSchema =
	_configRegionRuleIfAssuredOverAgeSchema as configRegionRuleIfAssuredOverAgeSchema;
export const configRegionRuleIfAssuredUnderAgeSchema =
	_configRegionRuleIfAssuredUnderAgeSchema as configRegionRuleIfAssuredUnderAgeSchema;
export const configRegionRuleIfDeclaredOverAgeSchema =
	_configRegionRuleIfDeclaredOverAgeSchema as configRegionRuleIfDeclaredOverAgeSchema;
export const configRegionRuleIfDeclaredUnderAgeSchema =
	_configRegionRuleIfDeclaredUnderAgeSchema as configRegionRuleIfDeclaredUnderAgeSchema;
export const eventSchema = _eventSchema as eventSchema;
export const stateSchema = _stateSchema as stateSchema;
export const stateMetadataSchema = _stateMetadataSchema as stateMetadataSchema;
export const statusSchema = _statusSchema as statusSchema;

export type Access = v.InferInput<typeof accessSchema>;
export interface Config extends v.InferInput<typeof configSchema> {}
export interface ConfigRegion extends v.InferInput<typeof configRegionSchema> {}
export interface ConfigRegionRuleDefault extends v.InferInput<typeof configRegionRuleDefaultSchema> {}
export interface ConfigRegionRuleIfAccountNewerThan extends v.InferInput<
	typeof configRegionRuleIfAccountNewerThanSchema
> {}
export interface ConfigRegionRuleIfAccountOlderThan extends v.InferInput<
	typeof configRegionRuleIfAccountOlderThanSchema
> {}
export interface ConfigRegionRuleIfAssuredOverAge extends v.InferInput<
	typeof configRegionRuleIfAssuredOverAgeSchema
> {}
export interface ConfigRegionRuleIfAssuredUnderAge extends v.InferInput<
	typeof configRegionRuleIfAssuredUnderAgeSchema
> {}
export interface ConfigRegionRuleIfDeclaredOverAge extends v.InferInput<
	typeof configRegionRuleIfDeclaredOverAgeSchema
> {}
export interface ConfigRegionRuleIfDeclaredUnderAge extends v.InferInput<
	typeof configRegionRuleIfDeclaredUnderAgeSchema
> {}
export interface Event extends v.InferInput<typeof eventSchema> {}
export interface State extends v.InferInput<typeof stateSchema> {}
export interface StateMetadata extends v.InferInput<typeof stateMetadataSchema> {}
export type Status = v.InferInput<typeof statusSchema>;
