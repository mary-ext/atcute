import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoLabelDefs from '../label/defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.temp.fetchLabels', {
	params: /*#__PURE__*/ v.object({
		since: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 250)]),
			50,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get labels() {
				return /*#__PURE__*/ v.array(ComAtprotoLabelDefs.labelSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.temp.fetchLabels': main$schema;
	}
}
