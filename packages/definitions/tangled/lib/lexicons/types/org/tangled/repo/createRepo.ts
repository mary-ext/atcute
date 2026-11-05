import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledRepoDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.repo.createRepo', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
			/** Default branch of the repository. */
			defaultBranch: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			/**
			 * @minGraphemes 1
			 * @maxGraphemes 140
			 */
			description: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringGraphemes(1, 140)]),
			),
			/** Optional user-provided DID to use as the repo identity instead of minting one. */
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/** Name of the repository. */
			name: /*#__PURE__*/ v.recordKeyString(),
			/** A source to clone from, populate this when forking or importing a repository. */
			get source() {
				return /*#__PURE__*/ v.optional(
					/*#__PURE__*/ v.variant([
						OrgTangledRepoDefs.sourceExternalSchema,
						OrgTangledRepoDefs.sourceTangledSchema,
					]),
				);
			},
			spindle: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/**
			 * Topics related to the repo
			 *
			 * @maxLength 50
			 */
			topics: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.constrain(
					/*#__PURE__*/ v.array(
						/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 50)]),
					),
					[/*#__PURE__*/ v.arrayLength(0, 50)],
				),
			),
			/** Any URI related to the repo */
			website: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
			/** Multibase-encoded public signing key the knot holds for this repository */
			key: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
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
		'org.tangled.repo.createRepo': mainSchema;
	}
}
