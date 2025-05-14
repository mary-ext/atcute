import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.repo.pull.status'),
		pull: /*#__PURE__*/ v.resourceUriString(),
		status: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<
				| 'sh.tangled.repo.pull.status.open'
				| 'sh.tangled.repo.pull.status.closed'
				| 'sh.tangled.repo.pull.status.merged'
				| (string & {})
			>(),
			'sh.tangled.repo.pull.status.open',
		),
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.repo.pull.status': mainSchema;
	}
}
