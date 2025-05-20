import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _labelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#label')),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	cts: /*#__PURE__*/ v.datetimeString(),
	exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	neg: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	sig: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
	src: /*#__PURE__*/ v.didString(),
	uri: /*#__PURE__*/ v.genericUriString(),
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
	ver: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _labelValueSchema = /*#__PURE__*/ v.string<
	| '!hide'
	| '!no-promote'
	| '!no-unauthenticated'
	| '!warn'
	| 'dmca-violation'
	| 'doxxing'
	| 'gore'
	| 'nsfl'
	| 'nudity'
	| 'porn'
	| 'sexual'
	| (string & {})
>();
const _labelValueDefinitionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinition')),
	adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	blurs: /*#__PURE__*/ v.string<'content' | 'media' | 'none' | (string & {})>(),
	defaultSetting: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'hide' | 'ignore' | 'warn' | (string & {})>(),
		'warn',
	),
	identifier: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100),
		/*#__PURE__*/ v.stringGraphemes(0, 100),
	]),
	get locales() {
		return /*#__PURE__*/ v.array(labelValueDefinitionStringsSchema);
	},
	severity: /*#__PURE__*/ v.string<'alert' | 'inform' | 'none' | (string & {})>(),
});
const _labelValueDefinitionStringsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinitionStrings'),
	),
	description: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100000),
		/*#__PURE__*/ v.stringGraphemes(0, 10000),
	]),
	lang: /*#__PURE__*/ v.languageCodeString(),
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 640),
		/*#__PURE__*/ v.stringGraphemes(0, 64),
	]),
});
const _selfLabelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabel')),
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
});
const _selfLabelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabels')),
	get values() {
		return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(selfLabelSchema), [
			/*#__PURE__*/ v.arrayLength(0, 10),
		]);
	},
});

type label$schematype = typeof _labelSchema;
type labelValue$schematype = typeof _labelValueSchema;
type labelValueDefinition$schematype = typeof _labelValueDefinitionSchema;
type labelValueDefinitionStrings$schematype = typeof _labelValueDefinitionStringsSchema;
type selfLabel$schematype = typeof _selfLabelSchema;
type selfLabels$schematype = typeof _selfLabelsSchema;

export interface labelSchema extends label$schematype {}
export interface labelValueSchema extends labelValue$schematype {}
export interface labelValueDefinitionSchema extends labelValueDefinition$schematype {}
export interface labelValueDefinitionStringsSchema extends labelValueDefinitionStrings$schematype {}
export interface selfLabelSchema extends selfLabel$schematype {}
export interface selfLabelsSchema extends selfLabels$schematype {}

export const labelSchema = _labelSchema as labelSchema;
export const labelValueSchema = _labelValueSchema as labelValueSchema;
export const labelValueDefinitionSchema = _labelValueDefinitionSchema as labelValueDefinitionSchema;
export const labelValueDefinitionStringsSchema =
	_labelValueDefinitionStringsSchema as labelValueDefinitionStringsSchema;
export const selfLabelSchema = _selfLabelSchema as selfLabelSchema;
export const selfLabelsSchema = _selfLabelsSchema as selfLabelsSchema;

export interface Label extends v.InferInput<typeof labelSchema> {}
export type LabelValue = v.InferInput<typeof labelValueSchema>;
export interface LabelValueDefinition extends v.InferInput<typeof labelValueDefinitionSchema> {}
export interface LabelValueDefinitionStrings extends v.InferInput<typeof labelValueDefinitionStringsSchema> {}
export interface SelfLabel extends v.InferInput<typeof selfLabelSchema> {}
export interface SelfLabels extends v.InferInput<typeof selfLabelsSchema> {}
