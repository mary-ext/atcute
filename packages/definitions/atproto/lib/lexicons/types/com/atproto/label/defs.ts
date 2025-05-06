import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _labelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#label')),
	ver: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
	src: /*#__PURE__*/ v.didString(),
	uri: /*#__PURE__*/ v.genericUriString(),
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
	neg: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	cts: /*#__PURE__*/ v.datetimeString(),
	exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	sig: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
});
const _selfLabelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabels')),
	get values() {
		return /*#__PURE__*/ v.constrain(v.array(selfLabelSchema), [/*#__PURE__*/ v.arrayLength(0, 10)]);
	},
});
const _selfLabelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabel')),
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
});
const _labelValueDefinitionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinition')),
	identifier: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100),
		/*#__PURE__*/ v.stringGraphemes(0, 100),
	]),
	severity: /*#__PURE__*/ v.string<'inform' | 'alert' | 'none' | (string & {})>(),
	blurs: /*#__PURE__*/ v.string<'content' | 'media' | 'none' | (string & {})>(),
	defaultSetting: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'ignore' | 'warn' | 'hide' | (string & {})>(),
		'warn',
	),
	adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	get locales() {
		return /*#__PURE__*/ v.array(labelValueDefinitionStringsSchema);
	},
});
const _labelValueDefinitionStringsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinitionStrings'),
	),
	lang: /*#__PURE__*/ v.languageCodeString(),
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 640),
		/*#__PURE__*/ v.stringGraphemes(0, 64),
	]),
	description: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100000),
		/*#__PURE__*/ v.stringGraphemes(0, 10000),
	]),
});
const _labelValueSchema = /*#__PURE__*/ v.string<
	| '!hide'
	| '!no-promote'
	| '!warn'
	| '!no-unauthenticated'
	| 'dmca-violation'
	| 'doxxing'
	| 'porn'
	| 'sexual'
	| 'nudity'
	| 'nsfl'
	| 'gore'
	| (string & {})
>();

type label$schematype = typeof _labelSchema;
type selfLabels$schematype = typeof _selfLabelsSchema;
type selfLabel$schematype = typeof _selfLabelSchema;
type labelValueDefinition$schematype = typeof _labelValueDefinitionSchema;
type labelValueDefinitionStrings$schematype = typeof _labelValueDefinitionStringsSchema;
type labelValue$schematype = typeof _labelValueSchema;

/** @deprecated */
export interface label$schema extends label$schematype {}
/** @deprecated */
export interface selfLabels$schema extends selfLabels$schematype {}
/** @deprecated */
export interface selfLabel$schema extends selfLabel$schematype {}
/** @deprecated */
export interface labelValueDefinition$schema extends labelValueDefinition$schematype {}
/** @deprecated */
export interface labelValueDefinitionStrings$schema extends labelValueDefinitionStrings$schematype {}
/** @deprecated */
export interface labelValue$schema extends labelValue$schematype {}

export const labelSchema = _labelSchema as label$schema;
export const selfLabelsSchema = _selfLabelsSchema as selfLabels$schema;
export const selfLabelSchema = _selfLabelSchema as selfLabel$schema;
export const labelValueDefinitionSchema = _labelValueDefinitionSchema as labelValueDefinition$schema;
export const labelValueDefinitionStringsSchema =
	_labelValueDefinitionStringsSchema as labelValueDefinitionStrings$schema;
export const labelValueSchema = _labelValueSchema as labelValue$schema;

export interface Label extends v.InferInput<typeof labelSchema> {}
export interface SelfLabels extends v.InferInput<typeof selfLabelsSchema> {}
export interface SelfLabel extends v.InferInput<typeof selfLabelSchema> {}
export interface LabelValueDefinition extends v.InferInput<typeof labelValueDefinitionSchema> {}
export interface LabelValueDefinitionStrings extends v.InferInput<typeof labelValueDefinitionStringsSchema> {}
export type LabelValue = v.InferInput<typeof labelValueSchema>;
