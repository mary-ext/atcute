import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('site.standard.graph.recommend'),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * AT-URI reference to the document record being recommended (ex:
		 * at://did:plc:abc123/site.standard.document/xyz789).
		 */
		document: /*#__PURE__*/ v.resourceUriString(),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'site.standard.graph.recommend': mainSchema;
	}
}
