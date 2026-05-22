import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletPagesCanvas from './pages/canvas.ts';
import * as PubLeafletPagesLinearDocument from './pages/linearDocument.ts';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.content')),
	/**
	 * JSON-encoded array of pages. When the inline pages array would be too large to store on the PDS, the
	 * pages are uploaded as a blob and referenced here. When set, consumers MUST ignore `pages` and use the
	 * decoded blob contents as the page array; the inline `pages` field will be empty or a stub.
	 *
	 * @accept application/json
	 * @maxSize 5000000
	 */
	blobPages: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
			/*#__PURE__*/ v.blobSize(5000000),
			/*#__PURE__*/ v.blobAccept(['application/json']),
		]),
	),
	/**
	 * Blobs referenced inside `blobPages`. Load-bearing when `blobPages` is set: the PDS only scans the top
	 * level of a record for blob references when deciding what to garbage-collect, so any image/etc. blob now
	 * living inside the opaque JSON blob must be mirrored here to remain referenced.
	 */
	blobs: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.array(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [/*#__PURE__*/ v.blobSize(10000000)]),
		),
	),
	get pages() {
		return /*#__PURE__*/ v.array(
			/*#__PURE__*/ v.variant([PubLeafletPagesCanvas.mainSchema, PubLeafletPagesLinearDocument.mainSchema]),
		);
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
