import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _controlSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.subscribePipelineLogs#control')),
	/** Step command */
	command: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	content: /*#__PURE__*/ v.string(),
	/** Step kind */
	kind: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['system', 'user'])),
	/** Step status */
	status: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['end', 'start'])),
	/** Step ID */
	step: /*#__PURE__*/ v.integer(),
	time: /*#__PURE__*/ v.datetimeString(),
	/** workflow name */
	workflow: /*#__PURE__*/ v.string(),
});
const _dataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.ci.subscribePipelineLogs#data')),
	content: /*#__PURE__*/ v.string(),
	/** Step ID */
	step: /*#__PURE__*/ v.integer(),
	stream: /*#__PURE__*/ v.literalEnum(['stderr', 'stdout']),
	time: /*#__PURE__*/ v.datetimeString(),
	/** workflow name */
	workflow: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('sh.tangled.ci.subscribePipelineLogs', {
	params: /*#__PURE__*/ v.object({
		/** Pipeline ID */
		pipeline: /*#__PURE__*/ v.tidString(),
		/** filter logs by specific workflows */
		workflows: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([controlSchema, dataSchema]);
	},
});

type control$schematype = typeof _controlSchema;
type data$schematype = typeof _dataSchema;
type main$schematype = typeof _mainSchema;

export interface controlSchema extends control$schematype {}
export interface dataSchema extends data$schematype {}
export interface mainSchema extends main$schematype {}

export const controlSchema = _controlSchema as controlSchema;
export const dataSchema = _dataSchema as dataSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Control extends v.InferInput<typeof controlSchema> {}
export interface Data extends v.InferInput<typeof dataSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'sh.tangled.ci.subscribePipelineLogs': mainSchema;
	}
}
