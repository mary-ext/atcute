import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _externalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#external')),
	description: /*#__PURE__*/ v.string(),
	/**
	 * @accept image/*
	 * @maxSize 1000000
	 */
	thumb: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
	title: /*#__PURE__*/ v.string(),
	uri: /*#__PURE__*/ v.genericUriString(),
});
const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external')),
	get external() {
		return externalSchema;
	},
});
const _viewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#view')),
	get external() {
		return viewExternalSchema;
	},
});
const _viewExternalSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.embed.external#viewExternal')),
	description: /*#__PURE__*/ v.string(),
	thumb: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
	title: /*#__PURE__*/ v.string(),
	uri: /*#__PURE__*/ v.genericUriString(),
});

type external$schematype = typeof _externalSchema;
type main$schematype = typeof _mainSchema;
type view$schematype = typeof _viewSchema;
type viewExternal$schematype = typeof _viewExternalSchema;

export interface externalSchema extends external$schematype {}
export interface mainSchema extends main$schematype {}
export interface viewSchema extends view$schematype {}
export interface viewExternalSchema extends viewExternal$schematype {}

export const externalSchema = _externalSchema as externalSchema;
export const mainSchema = _mainSchema as mainSchema;
export const viewSchema = _viewSchema as viewSchema;
export const viewExternalSchema = _viewExternalSchema as viewExternalSchema;

export interface External extends v.InferInput<typeof externalSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface View extends v.InferInput<typeof viewSchema> {}
export interface ViewExternal extends v.InferInput<typeof viewExternalSchema> {}
