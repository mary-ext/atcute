import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from '@atcute/atproto/types/admin/defs';
import * as ToolsOzoneSignatureDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.signature.findRelatedAccounts', {
	params: /*#__PURE__*/ v.object({
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		did: /*#__PURE__*/ v.didString(),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get accounts() {
				return /*#__PURE__*/ v.array(relatedAccountSchema);
			},
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		}),
	},
});
const _relatedAccountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('tools.ozone.signature.findRelatedAccounts#relatedAccount'),
	),
	get account() {
		return ComAtprotoAdminDefs.accountViewSchema;
	},
	get similarities() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ToolsOzoneSignatureDefs.sigDetailSchema));
	},
});

type main$schematype = typeof _mainSchema;
type relatedAccount$schematype = typeof _relatedAccountSchema;

export interface mainSchema extends main$schematype {}
export interface relatedAccountSchema extends relatedAccount$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const relatedAccountSchema = _relatedAccountSchema as relatedAccountSchema;

export interface RelatedAccount extends v.InferInput<typeof relatedAccountSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.signature.findRelatedAccounts': mainSchema;
	}
}
