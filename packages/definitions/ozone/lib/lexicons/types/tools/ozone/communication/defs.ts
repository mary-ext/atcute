import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _templateViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.communication.defs#templateView')),
	contentMarkdown: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	disabled: /*#__PURE__*/ v.boolean(),
	id: /*#__PURE__*/ v.string(),
	lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
	lastUpdatedBy: /*#__PURE__*/ v.didString(),
	name: /*#__PURE__*/ v.string(),
	subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});

type templateView$schematype = typeof _templateViewSchema;

export interface templateViewSchema extends templateView$schematype {}

export const templateViewSchema = _templateViewSchema as templateViewSchema;

export interface TemplateView extends v.InferInput<typeof templateViewSchema> {}
