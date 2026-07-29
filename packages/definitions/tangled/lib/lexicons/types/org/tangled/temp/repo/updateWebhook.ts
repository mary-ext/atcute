import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.temp.repo.updateWebhook', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			active: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
			events: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
			/** Webhook ID to update. */
			id: /*#__PURE__*/ v.integer(),
			/** DID of the repository as minted by the knot. */
			repoDid: /*#__PURE__*/ v.didString(),
			secret: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
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
		'org.tangled.temp.repo.updateWebhook': mainSchema;
	}
}
