import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.procedure('sh.tangled.repo.removeCollaborator', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** DID of the repository to remove the collaborator from */
			repo: /*#__PURE__*/ v.didString(),
			/** DID of the collaborator to remove */
			subject: /*#__PURE__*/ v.didString(),
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
		'sh.tangled.repo.removeCollaborator': mainSchema;
	}
}
