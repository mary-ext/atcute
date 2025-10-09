import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoServerDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.server.getAccountInviteCodes', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Controls whether any new 'earned' but not 'created' invites should be created.
		 * @default true
		 */
		createAvailable: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
		/**
		 * @default true
		 */
		includeUsed: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), true),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get codes() {
				return /*#__PURE__*/ v.array(ComAtprotoServerDefs.inviteCodeSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.server.getAccountInviteCodes': mainSchema;
	}
}
