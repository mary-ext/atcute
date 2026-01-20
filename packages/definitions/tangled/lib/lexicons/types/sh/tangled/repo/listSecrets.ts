import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('sh.tangled.repo.listSecrets', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.resourceUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get secrets() {
				return /*#__PURE__*/ v.array(secretSchema);
			},
		}),
	},
});
const _secretSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.listSecrets#secret')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	createdBy: /*#__PURE__*/ v.didString(),
	/**
	 * @minLength 1
	 * @maxLength 50
	 */
	key: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(1, 50)]),
	repo: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type secret$schematype = typeof _secretSchema;

export interface mainSchema extends main$schematype {}
export interface secretSchema extends secret$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const secretSchema = _secretSchema as secretSchema;

export interface Secret extends v.InferInput<typeof secretSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'sh.tangled.repo.listSecrets': mainSchema;
	}
}
