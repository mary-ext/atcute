import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcSubscription('com.atproto.label.subscribeLabels', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	}),
	get message() {
		return /*#__PURE__*/ v.variant([labelsSchema, infoSchema]);
	},
});
const _labelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#labels')),
	seq: /*#__PURE__*/ v.integer(),
	get labels() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
	},
});
const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#info')),
	name: /*#__PURE__*/ v.string<'OutdatedCursor' | (string & {})>(),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type main$schematype = typeof _mainSchema;
type labels$schematype = typeof _labelsSchema;
type info$schematype = typeof _infoSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}
/** @deprecated */
export interface labels$schema extends labels$schematype {}
/** @deprecated */
export interface info$schema extends info$schematype {}

export const mainSchema = _mainSchema as main$schema;
export const labelsSchema = _labelsSchema as labels$schema;
export const infoSchema = _infoSchema as info$schema;

export interface Labels extends v.InferInput<typeof labelsSchema> {}
export interface Info extends v.InferInput<typeof infoSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.label.subscribeLabels': main$schema;
	}
}
