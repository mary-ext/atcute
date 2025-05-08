import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('app.bsky.graph.unmuteThread', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			root: /*#__PURE__*/ v.resourceUriString(),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.graph.unmuteThread': mainSchema;
	}
}
