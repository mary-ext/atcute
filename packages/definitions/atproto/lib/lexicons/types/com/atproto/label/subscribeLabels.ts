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
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

const _labelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#labels')),
	seq: /*#__PURE__*/ v.integer(),
	get labels() {
		return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
	},
});
export const labelsSchema = _labelsSchema as labelsSchema.$schema;
export interface Labels extends v.InferInput<typeof labelsSchema> {}
export declare namespace labelsSchema {
	export {};
	type $schematype = typeof _labelsSchema;
	export interface $schema extends $schematype {}
}

const _infoSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.subscribeLabels#info')),
	name: /*#__PURE__*/ v.string(),
	message: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
export const infoSchema = _infoSchema as infoSchema.$schema;
export interface Info extends v.InferInput<typeof infoSchema> {}
export declare namespace infoSchema {
	export {};
	type $schematype = typeof _infoSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCSubscriptions {
		'com.atproto.label.subscribeLabels': mainSchema.$schema;
	}
}
