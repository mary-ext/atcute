import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.spindle.quota.releaseNars', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * nars to release, as cache keys like nar/<hash>.nar.xz (a bare file name works too) or as nix store
			 * paths like /nix/store/<hash>-name
			 *
			 * @minLength 1
			 * @maxLength 1000
			 */
			nars: /*#__PURE__*/ v.constrain(
				/*#__PURE__*/ v.array(
					/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 512)]),
				),
				[/*#__PURE__*/ v.arrayLength(1, 1000)],
			),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** cache storage bytes given back */
			bytes: /*#__PURE__*/ v.integer(),
			/** how many allocations were deleted */
			released: /*#__PURE__*/ v.integer(),
			/** the inputs that matched no allocation */
			unmatched: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.temp.spindle.quota.releaseNars': mainSchema;
	}
}
