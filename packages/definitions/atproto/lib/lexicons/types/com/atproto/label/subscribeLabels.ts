import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from './defs.js';

const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#info')),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	name: /*#__PURE__*/ v.string<'OutdatedCursor' | (string & {})>(),
});
const _labelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#labels')),
	get labels() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
	},
	seq: /*#__PURE__*/ v.integer(),
});
const _mainSchema = /*#__PURE__*/ v.subscription('com.atproto.label.subscribeLabels', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The last known event seq number to backfill from.
		 */
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([infoSchema, labelsSchema]);
	},
});

type info$schematype = typeof _infoSchema;
type labels$schematype = typeof _labelsSchema;
type main$schematype = typeof _mainSchema;

export interface infoSchema extends info$schematype {}
export interface labelsSchema extends labels$schematype {}
export interface mainSchema extends main$schematype {}

export const infoSchema = _infoSchema as infoSchema;
export const labelsSchema = _labelsSchema as labelsSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Info extends v.InferInput<typeof infoSchema> {}
export interface Labels extends v.InferInput<typeof labelsSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $message = v.InferInput<mainSchema['message']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.label.subscribeLabels': mainSchema;
	}
}
