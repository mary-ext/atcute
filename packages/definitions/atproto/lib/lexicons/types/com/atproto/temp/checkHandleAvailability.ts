import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.temp.checkHandleAvailability', {
	params: /*#__PURE__*/ v.object({
		/**
		 * User-provided birth date. Might be used to build handle suggestions.
		 */
		birthDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/**
		 * User-provided email. Might be used to build handle suggestions.
		 */
		email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * Tentative handle. Will be checked for availability or used to build handle suggestions.
		 */
		handle: /*#__PURE__*/ v.handleString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Echo of the input handle.
			 */
			handle: /*#__PURE__*/ v.handleString(),
			get result() {
				return /*#__PURE__*/ v.variant([resultAvailableSchema, resultUnavailableSchema]);
			},
		}),
	},
});
const _resultAvailableSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.temp.checkHandleAvailability#resultAvailable'),
	),
});
const _resultUnavailableSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.temp.checkHandleAvailability#resultUnavailable'),
	),
	/**
	 * List of suggested handles based on the provided inputs.
	 */
	get suggestions() {
		return /*#__PURE__*/ v.array(suggestionSchema);
	},
});
const _suggestionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.temp.checkHandleAvailability#suggestion'),
	),
	handle: /*#__PURE__*/ v.handleString(),
	/**
	 * Method used to build this suggestion. Should be considered opaque to clients. Can be used for metrics.
	 */
	method: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;
type resultAvailable$schematype = typeof _resultAvailableSchema;
type resultUnavailable$schematype = typeof _resultUnavailableSchema;
type suggestion$schematype = typeof _suggestionSchema;

export interface mainSchema extends main$schematype {}
export interface resultAvailableSchema extends resultAvailable$schematype {}
export interface resultUnavailableSchema extends resultUnavailable$schematype {}
export interface suggestionSchema extends suggestion$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const resultAvailableSchema = _resultAvailableSchema as resultAvailableSchema;
export const resultUnavailableSchema = _resultUnavailableSchema as resultUnavailableSchema;
export const suggestionSchema = _suggestionSchema as suggestionSchema;

export interface ResultAvailable extends v.InferInput<typeof resultAvailableSchema> {}
export interface ResultUnavailable extends v.InferInput<typeof resultUnavailableSchema> {}
export interface Suggestion extends v.InferInput<typeof suggestionSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.temp.checkHandleAvailability': mainSchema;
	}
}
