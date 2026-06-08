import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.knot.version', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * Protocol capability tokens this knot implements, such as knot-acl. Knots that omit this field are
			 * treated as legacy.
			 */
			capabilities: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			version: /*#__PURE__*/ v.string(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.knot.version': mainSchema;
	}
}
