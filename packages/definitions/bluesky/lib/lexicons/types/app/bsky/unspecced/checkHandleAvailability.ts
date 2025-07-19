import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.unspecced.checkHandleAvailability', {
	params: /*#__PURE__*/ v.object({
		birthDate: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		email: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		handle: /*#__PURE__*/ v.handleString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			handle: /*#__PURE__*/ v.handleString(),
			get result() {
				return /*#__PURE__*/ v.variant([resultAvailableSchema, resultUnavailableSchema]);
			},
		}),
	},
});
const _resultAvailableSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.checkHandleAvailability#resultAvailable'),
	),
});
const _resultUnavailableSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.checkHandleAvailability#resultUnavailable'),
	),
	get suggestions() {
		return /*#__PURE__*/ v.array(suggestionSchema);
	},
});
const _suggestionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('app.bsky.unspecced.checkHandleAvailability#suggestion'),
	),
	handle: /*#__PURE__*/ v.handleString(),
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
		'app.bsky.unspecced.checkHandleAvailability': mainSchema;
	}
}
