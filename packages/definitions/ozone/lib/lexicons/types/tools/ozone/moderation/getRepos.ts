import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('tools.ozone.moderation.getRepos', {
	params: /*#__PURE__*/ v.object({
		dids: /*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(0, 100),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get repos() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						ToolsOzoneModerationDefs.repoViewDetailSchema,
						ToolsOzoneModerationDefs.repoViewNotFoundSchema,
					]),
				);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.getRepos': mainSchema;
	}
}
