import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo.pull'),
		body: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		dependentOn: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		mentions: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		references: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString())),
		get rounds() {
			return /*#__PURE__*/ v.array(roundSchema);
		},
		get source() {
			return /*#__PURE__*/ v.optional(sourceSchema);
		},
		get target() {
			return targetSchema;
		},
		title: /*#__PURE__*/ v.string(),
	}),
);
const _roundSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.pull#round')),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** @accept application/gzip */
	patchBlob: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
		/*#__PURE__*/ v.blobAccept(['application/gzip']),
	]),
});
const _sourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.pull#source')),
	branch: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
});
const _targetSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.pull#target')),
	branch: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.didString(),
});

type main$schematype = typeof _mainSchema;
type round$schematype = typeof _roundSchema;
type source$schematype = typeof _sourceSchema;
type target$schematype = typeof _targetSchema;

export interface mainSchema extends main$schematype {}
export interface roundSchema extends round$schematype {}
export interface sourceSchema extends source$schematype {}
export interface targetSchema extends target$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const roundSchema = _roundSchema as roundSchema;
export const sourceSchema = _sourceSchema as sourceSchema;
export const targetSchema = _targetSchema as targetSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Round extends v.InferInput<typeof roundSchema> {}
export interface Source extends v.InferInput<typeof sourceSchema> {}
export interface Target extends v.InferInput<typeof targetSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.repo.pull': mainSchema;
	}
}
