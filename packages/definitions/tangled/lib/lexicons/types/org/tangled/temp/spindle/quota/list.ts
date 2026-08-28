import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempSpindleQuotaDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.spindle.quota.list', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** quota overrides ordered by DID and resource */
			get limits() {
				return /*#__PURE__*/ v.array(OrgTangledTempSpindleQuotaDefs.limitSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.spindle.quota.list': mainSchema;
	}
}
