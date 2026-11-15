import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.snippet.string'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/** @maxGraphemes 256 */
		description: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(0, 256)]),
		),
		get snippet() {
			return /*#__PURE__*/ v.variant([textFileSchema]);
		},
	}),
);
const _textFileSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.snippet.string#textFile')),
	content: /*#__PURE__*/ v.blob(),
	/**
	 * file name
	 *
	 * @maxGraphemes 140
	 */
	name: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(0, 140)]),
});

type main$schematype = typeof _mainSchema;
type textFile$schematype = typeof _textFileSchema;

export interface mainSchema extends main$schematype {}
export interface textFileSchema extends textFile$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const textFileSchema = _textFileSchema as textFileSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface TextFile extends v.InferInput<typeof textFileSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.snippet.string': mainSchema;
	}
}
