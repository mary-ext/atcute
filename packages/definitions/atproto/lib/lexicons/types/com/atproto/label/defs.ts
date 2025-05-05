import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _labelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#label')),
	ver: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	src: /*#__PURE__*/ v.didString(),
	uri: /*#__PURE__*/ v.genericUriString(),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	val: /*#__PURE__*/ v.pipe(/*#__PURE__*/ v.string(), /*#__PURE__*/ v.stringLength(0, 128)),
	neg: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	cts: /*#__PURE__*/ v.datetimeString(),
	exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	sig: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
});
export const labelSchema = _labelSchema as labelSchema.$schema;
export interface Label extends v.InferInput<typeof labelSchema> {}
export declare namespace labelSchema {
	export {};
	type $schematype = typeof _labelSchema;
	export interface $schema extends $schematype {}
}

const _selfLabelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabels')),
	get values() {
		return /*#__PURE__*/ v.pipe(v.array(selfLabelSchema), /*#__PURE__*/ v.arrayLength(0, 10));
	},
});
export const selfLabelsSchema = _selfLabelsSchema as selfLabelsSchema.$schema;
export interface SelfLabels extends v.InferInput<typeof selfLabelsSchema> {}
export declare namespace selfLabelsSchema {
	export {};
	type $schematype = typeof _selfLabelsSchema;
	export interface $schema extends $schematype {}
}

const _selfLabelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabel')),
	val: /*#__PURE__*/ v.pipe(/*#__PURE__*/ v.string(), /*#__PURE__*/ v.stringLength(0, 128)),
});
export const selfLabelSchema = _selfLabelSchema as selfLabelSchema.$schema;
export interface SelfLabel extends v.InferInput<typeof selfLabelSchema> {}
export declare namespace selfLabelSchema {
	export {};
	type $schematype = typeof _selfLabelSchema;
	export interface $schema extends $schematype {}
}

const _labelValueDefinitionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinition')),
	identifier: /*#__PURE__*/ v.pipe(
		/*#__PURE__*/ v.string(),
		/*#__PURE__*/ v.stringLength(0, 100),
		/*#__PURE__*/ v.stringGraphemes(0, 100),
	),
	severity: /*#__PURE__*/ v.string(),
	blurs: /*#__PURE__*/ v.string(),
	defaultSetting: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'warn'),
	adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get locales() {
		return /*#__PURE__*/ v.array(labelValueDefinitionStringsSchema);
	},
});
export const labelValueDefinitionSchema = _labelValueDefinitionSchema as labelValueDefinitionSchema.$schema;
export interface LabelValueDefinition extends v.InferInput<typeof labelValueDefinitionSchema> {}
export declare namespace labelValueDefinitionSchema {
	export {};
	type $schematype = typeof _labelValueDefinitionSchema;
	export interface $schema extends $schematype {}
}

const _labelValueDefinitionStringsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinitionStrings'),
	),
	lang: /*#__PURE__*/ v.languageCodeString(),
	name: /*#__PURE__*/ v.pipe(
		/*#__PURE__*/ v.string(),
		/*#__PURE__*/ v.stringLength(0, 640),
		/*#__PURE__*/ v.stringGraphemes(0, 64),
	),
	description: /*#__PURE__*/ v.pipe(
		/*#__PURE__*/ v.string(),
		/*#__PURE__*/ v.stringLength(0, 100000),
		/*#__PURE__*/ v.stringGraphemes(0, 10000),
	),
});
export const labelValueDefinitionStringsSchema =
	_labelValueDefinitionStringsSchema as labelValueDefinitionStringsSchema.$schema;
export interface LabelValueDefinitionStrings extends v.InferInput<typeof labelValueDefinitionStringsSchema> {}
export declare namespace labelValueDefinitionStringsSchema {
	export {};
	type $schematype = typeof _labelValueDefinitionStringsSchema;
	export interface $schema extends $schematype {}
}

const _labelValueSchema = /*#__PURE__*/ v.string();
export const labelValueSchema = _labelValueSchema as labelValueSchema.$schema;
export type LabelValue = v.InferInput<typeof labelValueSchema>;
export declare namespace labelValueSchema {
	export {};
	type $schematype = typeof _labelValueSchema;
	export interface $schema extends $schematype {}
}
