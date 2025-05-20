import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as AppBskyLabelerDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.labeler.getServices', {
	params: /*#__PURE__*/ v.object({
		detailed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		dids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get views() {
				return /*#__PURE__*/ v.array(
					/*#__PURE__*/ v.variant([
						AppBskyLabelerDefs.labelerViewSchema,
						AppBskyLabelerDefs.labelerViewDetailedSchema,
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
		'app.bsky.labeler.getServices': mainSchema;
	}
}
