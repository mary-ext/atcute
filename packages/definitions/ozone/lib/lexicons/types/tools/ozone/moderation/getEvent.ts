import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.getEvent', {
	params: /*#__PURE__*/ v.object({
		id: /*#__PURE__*/ v.integer(),
	}),
	output: {
		type: 'lex',
		get schema() {
			return ToolsOzoneModerationDefs.modEventViewDetailSchema;
		},
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.getEvent': mainSchema;
	}
}
