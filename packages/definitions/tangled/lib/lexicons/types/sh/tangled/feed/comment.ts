import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ShTangledMarkupMarkdown from '../markup/markdown.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.feed.comment'),
		get body() {
			return /*#__PURE__*/ v.variant([ShTangledMarkupMarkdown.mainSchema]);
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/**
		 * optional pull submission round index. required when subject is sh.tangled.repo.pull
		 *
		 * @minimum 0
		 */
		pullRoundIdx: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
		get replyTo() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		get subject() {
			return ComAtprotoRepoStrongRef.mainSchema;
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.feed.comment': mainSchema;
	}
}
