import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _accountCreatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.hosting.getAccountHistory#accountCreated'),
	),
	email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	handle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.handleString()),
});
const _emailConfirmedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.hosting.getAccountHistory#emailConfirmed'),
	),
	email: /*#__PURE__*/ v.string(),
});
const _emailUpdatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.hosting.getAccountHistory#emailUpdated'),
	),
	email: /*#__PURE__*/ v.string(),
});
const _eventSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.hosting.getAccountHistory#event')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	createdBy: /*#__PURE__*/ v.string(),
	get details() {
		return /*#__PURE__*/ v.variant([
			accountCreatedSchema,
			emailConfirmedSchema,
			emailUpdatedSchema,
			handleUpdatedSchema,
			passwordUpdatedSchema,
		]);
	},
});
const _handleUpdatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.hosting.getAccountHistory#handleUpdated'),
	),
	handle: /*#__PURE__*/ v.handleString(),
});
const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.hosting.getAccountHistory', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		did: /*#__PURE__*/ v.didString(),
		events: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.array(
				/*#__PURE__*/ v.string<
					| 'accountCreated'
					| 'emailConfirmed'
					| 'emailUpdated'
					| 'handleUpdated'
					| 'passwordUpdated'
					| (string & {})
				>(),
			),
		),
		/**
		 * @minimum 1
		 * @maximum 100
		 * @default 50
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get events() {
				return /*#__PURE__*/ v.array(eventSchema);
			},
		}),
	},
});
const _passwordUpdatedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.hosting.getAccountHistory#passwordUpdated'),
	),
});

type accountCreated$schematype = typeof _accountCreatedSchema;
type emailConfirmed$schematype = typeof _emailConfirmedSchema;
type emailUpdated$schematype = typeof _emailUpdatedSchema;
type event$schematype = typeof _eventSchema;
type handleUpdated$schematype = typeof _handleUpdatedSchema;
type main$schematype = typeof _mainSchema;
type passwordUpdated$schematype = typeof _passwordUpdatedSchema;

export interface accountCreatedSchema extends accountCreated$schematype {}
export interface emailConfirmedSchema extends emailConfirmed$schematype {}
export interface emailUpdatedSchema extends emailUpdated$schematype {}
export interface eventSchema extends event$schematype {}
export interface handleUpdatedSchema extends handleUpdated$schematype {}
export interface mainSchema extends main$schematype {}
export interface passwordUpdatedSchema extends passwordUpdated$schematype {}

export const accountCreatedSchema = _accountCreatedSchema as accountCreatedSchema;
export const emailConfirmedSchema = _emailConfirmedSchema as emailConfirmedSchema;
export const emailUpdatedSchema = _emailUpdatedSchema as emailUpdatedSchema;
export const eventSchema = _eventSchema as eventSchema;
export const handleUpdatedSchema = _handleUpdatedSchema as handleUpdatedSchema;
export const mainSchema = _mainSchema as mainSchema;
export const passwordUpdatedSchema = _passwordUpdatedSchema as passwordUpdatedSchema;

export interface AccountCreated extends v.InferInput<typeof accountCreatedSchema> {}
export interface EmailConfirmed extends v.InferInput<typeof emailConfirmedSchema> {}
export interface EmailUpdated extends v.InferInput<typeof emailUpdatedSchema> {}
export interface Event extends v.InferInput<typeof eventSchema> {}
export interface HandleUpdated extends v.InferInput<typeof handleUpdatedSchema> {}
export interface PasswordUpdated extends v.InferInput<typeof passwordUpdatedSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.hosting.getAccountHistory': mainSchema;
	}
}
