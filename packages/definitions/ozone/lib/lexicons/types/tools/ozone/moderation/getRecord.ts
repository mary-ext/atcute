import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.getRecord', {
	params: /*#__PURE__*/ v.object({
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		uri: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneModerationDefs.recordViewDetailSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export type $output = v.InferXRPCBodyInput<mainSchema['output']>;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.getRecord': mainSchema;
	}
}
