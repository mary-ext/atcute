import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from './defs.js';
import * as ComAtprotoRepoStrongRef from '../repo/strongRef.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.admin.getSubjectStatus', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		uri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		blob: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get subject() {
				return /*#__PURE__*/ v.variant([
					ComAtprotoAdminDefs.repoRefSchema,
					ComAtprotoRepoStrongRef.mainSchema,
					ComAtprotoAdminDefs.repoBlobRefSchema,
				]);
			},
			get takedown() {
				return /*#__PURE__*/ v.optional(ComAtprotoAdminDefs.statusAttrSchema);
			},
			get deactivated() {
				return /*#__PURE__*/ v.optional(ComAtprotoAdminDefs.statusAttrSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.admin.getSubjectStatus': mainSchema;
	}
}
