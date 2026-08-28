import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.spindle.quota.set', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** DID of the repository or account owner */
			did: /*#__PURE__*/ v.didString(),
			/** positive maximum in the resource's native units; cannot be combined with unlimited */
			limit: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
			/** quota resource name, such as workflows, vcpus, memory_mib, disk_mib, or cache_storage_bytes */
			resource: /*#__PURE__*/ v.string(),
			/** store an unlimited override; cannot be combined with limit */
			unlimited: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.spindle.quota.set': mainSchema;
	}
}
