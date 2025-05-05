import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoServerDefs from '../server/defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.admin.getInviteCodes', {
	params: /*#__PURE__*/ v.object({
		sort: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string(), 'recent'),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.pipe(/*#__PURE__*/ v.integer(), /*#__PURE__*/ v.integerRange(1, 500)),
			100,
		),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get codes() {
				return /*#__PURE__*/ v.array(ComAtprotoServerDefs.inviteCodeSchema);
			},
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.admin.getInviteCodes': mainSchema.$schema;
	}
}
