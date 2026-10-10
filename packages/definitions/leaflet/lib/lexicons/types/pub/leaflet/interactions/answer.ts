import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as PubLeafletPagesLinearDocument from '../pages/linearDocument.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('pub.leaflet.interactions.answer'),
		/** The answer's blocks. */
		get content() {
			return PubLeafletPagesLinearDocument.mainSchema;
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/** The document the question was asked on. */
		document: /*#__PURE__*/ v.resourceUriString(),
		/** The question being answered. */
		get question() {
			return ComAtprotoRepoStrongRef.mainSchema;
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'pub.leaflet.interactions.answer': mainSchema;
	}
}
