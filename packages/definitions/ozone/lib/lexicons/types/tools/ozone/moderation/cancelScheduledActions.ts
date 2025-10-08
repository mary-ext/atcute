import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _cancellationResultsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.cancelScheduledActions#cancellationResults'),
	),
	get failed() {
		return /*#__PURE__*/ v.array(failedCancellationSchema);
	},
	succeeded: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
});
const _failedCancellationSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.moderation.cancelScheduledActions#failedCancellation'),
	),
	did: /*#__PURE__*/ v.didString(),
	error: /*#__PURE__*/ v.string(),
	errorCode: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _mainSchema = /*#__PURE__*/ v.procedure('tools.ozone.moderation.cancelScheduledActions', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			subjects: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
				/*#__PURE__*/ v.arrayLength(0, 100),
			]),
		}),
	},
	output: {
		type: 'lex',
		get schema() {
			return cancellationResultsSchema;
		},
	},
});

type cancellationResults$schematype = typeof _cancellationResultsSchema;
type failedCancellation$schematype = typeof _failedCancellationSchema;
type main$schematype = typeof _mainSchema;

export interface cancellationResultsSchema extends cancellationResults$schematype {}
export interface failedCancellationSchema extends failedCancellation$schematype {}
export interface mainSchema extends main$schematype {}

export const cancellationResultsSchema = _cancellationResultsSchema as cancellationResultsSchema;
export const failedCancellationSchema = _failedCancellationSchema as failedCancellationSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface CancellationResults extends v.InferInput<typeof cancellationResultsSchema> {}
export interface FailedCancellation extends v.InferInput<typeof failedCancellationSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'tools.ozone.moderation.cancelScheduledActions': mainSchema;
	}
}
