import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ComAtprotoAdminDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.admin.getAccountInfos', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @minLength 1
		 */
		dids: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(1),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get infos() {
				return /*#__PURE__*/ v.array(ComAtprotoAdminDefs.accountViewSchema);
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
		'com.atproto.admin.getAccountInfos': mainSchema;
	}
}
