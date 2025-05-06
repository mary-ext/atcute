import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from './defs.js';

const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#info')),
	name: /*#__PURE__*/ v.string<'OutdatedCursor' | (string & {})>(),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _labelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#labels')),
	seq: /*#__PURE__*/ v.integer(),
	get labels() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
	},
});
const _mainSchema = /*#__PURE__*/ v.xrpcSubscription('com.atproto.label.subscribeLabels', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([labelsSchema, infoSchema]);
	},
});

type info$schematype = typeof _infoSchema;
type labels$schematype = typeof _labelsSchema;
type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface info$schema extends info$schematype {}
/** @deprecated */
export interface labels$schema extends labels$schematype {}
/** @deprecated */
export interface main$schema extends main$schematype {}

export const infoSchema = _infoSchema as info$schema;
export const labelsSchema = _labelsSchema as labels$schema;
export const mainSchema = _mainSchema as main$schema;

export interface Info extends v.InferInput<typeof infoSchema> {}
export interface Labels extends v.InferInput<typeof labelsSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.label.subscribeLabels': main$schema;
	}
}
