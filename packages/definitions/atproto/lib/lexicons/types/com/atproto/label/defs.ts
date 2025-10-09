import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _labelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#label')),
	/**
	 * Optionally, CID specifying the specific version of 'uri' resource this label applies to.
	 */
	cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	/**
	 * Timestamp when this label was created.
	 */
	cts: /*#__PURE__*/ v.datetimeString(),
	/**
	 * Timestamp at which this label expires (no longer applies).
	 */
	exp: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	/**
	 * If true, this is a negation label, overwriting a previous label.
	 */
	neg: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * Signature of dag-cbor encoded label.
	 */
	sig: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.bytes()),
	/**
	 * DID of the actor who created this label.
	 */
	src: /*#__PURE__*/ v.didString(),
	/**
	 * AT URI of the record, repository (account), or other resource that this label applies to.
	 */
	uri: /*#__PURE__*/ v.genericUriString(),
	/**
	 * The short string name of the value or type of this label.
	 * @maxLength 128
	 */
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
	/**
	 * The AT Protocol version of the label object.
	 */
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
	/**
	 * Does the user need to have adult content enabled in order to configure this label?
	 */
	adultOnly: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
	/**
	 * What should this label hide in the UI, if applied? 'content' hides all of the target; 'media' hides the images/video/audio; 'none' hides nothing.
	 */
	blurs: /*#__PURE__*/ v.string<'content' | 'media' | 'none' | (string & {})>(),
	/**
	 * The default setting for this label.
	 * @default "warn"
	 */
	defaultSetting: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<'hide' | 'ignore' | 'warn' | (string & {})>(),
		'warn',
	),
	/**
	 * The value of the label being defined. Must only include lowercase ascii and the '-' character ([a-z-]+).
	 * @maxLength 100
	 * @maxGraphemes 100
	 */
	identifier: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100),
		/*#__PURE__*/ v.stringGraphemes(0, 100),
	]),
	get locales() {
		return /*#__PURE__*/ v.array(labelValueDefinitionStringsSchema);
	},
	/**
	 * How should a client visually convey this label? 'inform' means neutral and informational; 'alert' means negative and warning; 'none' means show nothing.
	 */
	severity: /*#__PURE__*/ v.string<'alert' | 'inform' | 'none' | (string & {})>(),
});
const _labelValueDefinitionStringsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('com.atproto.label.defs#labelValueDefinitionStrings'),
	),
	/**
	 * A longer description of what the label means and why it might be applied.
	 * @maxLength 100000
	 * @maxGraphemes 10000
	 */
	description: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 100000),
		/*#__PURE__*/ v.stringGraphemes(0, 10000),
	]),
	/**
	 * The code of the language these strings are written in.
	 */
	lang: /*#__PURE__*/ v.languageCodeString(),
	/**
	 * A short human-readable name for the label.
	 * @maxLength 640
	 * @maxGraphemes 64
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
		/*#__PURE__*/ v.stringLength(0, 640),
		/*#__PURE__*/ v.stringGraphemes(0, 64),
	]),
});
const _selfLabelSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabel')),
	/**
	 * The short string name of the value or type of this label.
	 * @maxLength 128
	 */
	val: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 128)]),
});
const _selfLabelsSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('com.atproto.label.defs#selfLabels')),
	/**
	 * @maxLength 10
	 */
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
