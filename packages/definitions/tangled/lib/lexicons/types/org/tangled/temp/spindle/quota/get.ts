import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempSpindleQuotaDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.spindle.quota.get', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository or account owner */
		did: /*#__PURE__*/ v.didString(),
		/** quota resource to look up */
		resource: /*#__PURE__*/ v.string(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** quota override for the requested DID and resource */
			get limit() {
				return OrgTangledTempSpindleQuotaDefs.limitSchema;
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
		'org.tangled.temp.spindle.quota.get': mainSchema;
	}
}
