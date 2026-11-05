import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledRepoDefs from '../repo/defs.ts';

import * as OrgTangledActorDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.actor.getTrending', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** @maxLength 5 */
			get people() {
				return /*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(OrgTangledActorDefs.profileViewDetailedSchema),
					[/*#__PURE__*/ v.arrayLength(0, 5)],
				);
			},
			/** @maxLength 4 */
			get repos() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(OrgTangledRepoDefs.repoViewBasicSchema), [
					/*#__PURE__*/ v.arrayLength(0, 4),
				]);
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
		'org.tangled.actor.getTrending': mainSchema;
	}
}
