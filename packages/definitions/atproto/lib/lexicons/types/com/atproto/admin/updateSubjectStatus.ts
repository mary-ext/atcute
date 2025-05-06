import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from './defs.js';
import * as ComAtprotoRepoStrongRef from '../repo/strongRef.js';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('com.atproto.admin.updateSubjectStatus', {
	params: null,
	input: {
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
		}),
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'com.atproto.admin.updateSubjectStatus': main$schema;
	}
}
