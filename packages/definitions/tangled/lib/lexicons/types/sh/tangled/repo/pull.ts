import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo.pull'),
		body: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		patch: /*#__PURE__*/ v.string(),
		pullId: /*#__PURE__*/ v.integer(),
		get source() {
			return /*#__PURE__*/ v.optional(sourceSchema);
		},
		targetBranch: /*#__PURE__*/ v.string(),
		targetRepo: /*#__PURE__*/ v.resourceUriString(),
		title: /*#__PURE__*/ v.string(),
	}),
);
const _sourceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.repo.pull#source')),
	branch: /*#__PURE__*/ v.string(),
	repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
});

type main$schematype = typeof _mainSchema;
type source$schematype = typeof _sourceSchema;

export interface mainSchema extends main$schematype {}
export interface sourceSchema extends source$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const sourceSchema = _sourceSchema as sourceSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Source extends v.InferInput<typeof sourceSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.repo.pull': mainSchema;
	}
}
