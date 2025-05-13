import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoServerDefs from '../server/defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.admin.getInviteCodes', {
	params: /*#__PURE__*/ v.object({
		sort: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'recent' | 'usage' | (string & {})>(), 'recent'),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 500)]),
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

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.admin.getInviteCodes': mainSchema;
	}
}
