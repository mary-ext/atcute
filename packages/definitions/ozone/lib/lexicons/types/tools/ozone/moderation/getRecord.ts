import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.getRecord', {
	params: /*#__PURE__*/ v.object({
		uri: /*#__PURE__*/ v.resourceUriString(),
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.getRecord': mainSchema;
	}
}
