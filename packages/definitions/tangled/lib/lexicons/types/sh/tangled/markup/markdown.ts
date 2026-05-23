import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.markup.markdown')),
	/** list of blobs referenced in markdown */
	blobs: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
				/*#__PURE__*/ v.blobSize(1000000),
				/*#__PURE__*/ v.blobAccept(['image/*']),
			]),
		),
	),
	/** Original Markdown before post-processing. Used to restore original input on edit. */
	original: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	/** Final post-processed markdown content that will be rendered */
	text: /*#__PURE__*/ v.string(),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
