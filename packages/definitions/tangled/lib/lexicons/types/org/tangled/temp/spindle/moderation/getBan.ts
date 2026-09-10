import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledTempSpindleModerationDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.spindle.moderation.getBan', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository or account owner to look up */
		did: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** active ban matching the requested DID */
			get ban() {
				return OrgTangledTempSpindleModerationDefs.banSchema;
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
		'org.tangled.temp.spindle.moderation.getBan': mainSchema;
	}
}
