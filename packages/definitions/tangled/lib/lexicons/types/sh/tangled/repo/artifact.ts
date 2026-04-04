import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo.artifact'),
		/**
		 * the artifact
		 * @accept *\/*
		 * @maxSize 52428800
		 */
		artifact: /*#__PURE__*/ v.blob(),
		/**
		 * time of creation of this artifact
		 */
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * name of the artifact
		 */
		name: /*#__PURE__*/ v.string(),
		/**
		 * repo that this artifact is being uploaded to
		 */
		repo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		repoDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		/**
		 * hash of the tag object that this artifact is attached to (only annotated tags are supported)
		 * @minLength 20
		 * @maxLength 20
		 */
		tag: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(20, 20)]),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.repo.artifact': mainSchema;
	}
}
