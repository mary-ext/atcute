import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo.artifact'),
		name: /*#__PURE__*/ v.string(),
		repo: /*#__PURE__*/ v.resourceUriString(),
		tag: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.bytes(), [/*#__PURE__*/ v.bytesSize(20, 20)]),
		createdAt: /*#__PURE__*/ v.datetimeString(),
		artifact: /*#__PURE__*/ v.blob(),
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
