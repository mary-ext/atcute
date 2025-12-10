import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo.pull'),
		body: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		mentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		patch: /*#__PURE__*/ v.string(),
		references: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString())),
		get source() {
			return /*#__PURE__*/ v.optional(sourceSchema);
		},
		get target() {
			return targetSchema;
		},
		title: /*#__PURE__*/ v.string(),
	}),
);
const _sourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.pull#source')),
	branch: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
	/**
	 * @minLength 40
	 * @maxLength 40
	 */
	sha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
});
const _targetSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.pull#target')),
	branch: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.resourceUriString(),
});

type main$schematype = typeof _mainSchema;
type source$schematype = typeof _sourceSchema;
type target$schematype = typeof _targetSchema;

export interface mainSchema extends main$schematype {}
export interface sourceSchema extends source$schematype {}
export interface targetSchema extends target$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const sourceSchema = _sourceSchema as sourceSchema;
export const targetSchema = _targetSchema as targetSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Source extends v.InferInput<typeof sourceSchema> {}
export interface Target extends v.InferInput<typeof targetSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.repo.pull': mainSchema;
	}
}
