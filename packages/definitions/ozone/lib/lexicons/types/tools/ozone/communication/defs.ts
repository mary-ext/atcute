import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _templateViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.communication.defs#templateView')),
	/** Subject of the message, used in emails. */
	contentMarkdown: /*#__PURE__*/ v.string(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	disabled: /*#__PURE__*/ v.boolean(),
	id: /*#__PURE__*/ v.string(),
	/** Message language. */
	lang: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.languageCodeString()),
	/** DID of the user who last updated the template. */
	lastUpdatedBy: /*#__PURE__*/ v.didString(),
	/** Name of the template. */
	name: /*#__PURE__*/ v.string(),
	/** Content of the template, can contain markdown and variable placeholders. */
	subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});

type templateView$schematype = typeof _templateViewSchema;

export interface templateViewSchema extends templateView$schematype {}

export const templateViewSchema = _templateViewSchema as templateViewSchema;

export interface TemplateView extends v.InferInput<typeof templateViewSchema> {}
