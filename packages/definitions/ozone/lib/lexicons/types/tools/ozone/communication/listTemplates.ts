import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneCommunicationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.communication.listTemplates', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get communicationTemplates() {
				return /*#__PURE__*/ v.array(ToolsOzoneCommunicationDefs.templateViewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.communication.listTemplates': mainSchema;
	}
}
