import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledEmbedCommit from '../embed/commit.ts';
import * as OrgTangledMarkupMarkdown from '../markup/markdown.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.feed.comment'),
		get body() {
			return /*#__PURE__*/ v.variant([OrgTangledMarkupMarkdown.mainSchema]);
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		get embed() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([OrgTangledEmbedCommit.mainSchema]));
		},
		get replyTo() {
			return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
		},
		get subject() {
			return /*#__PURE__*/ v.variant([ComAtprotoRepoStrongRef.mainSchema]);
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.feed.comment': mainSchema;
	}
}
