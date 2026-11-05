import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledEmbedCommit from '../embed/commit.ts';
import * as OrgTangledMarkupMarkdown from '../markup/markdown.ts';

const _commentViewSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.feed.defs#commentView')),
	get body() {
		return /*#__PURE__*/ v.variant([OrgTangledMarkupMarkdown.mainSchema]);
	},
	cid: /*#__PURE__*/ v.cidString(),
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Who wrote this version (`x-tngl-editor`). A knot-hosted comment's uri names the repo, not the writer. */
	editor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
	get embed() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([OrgTangledEmbedCommit.viewSchema]));
	},
	get replyTo() {
		return /*#__PURE__*/ v.optional(ComAtprotoRepoStrongRef.mainSchema);
	},
	get subject() {
		return ComAtprotoRepoStrongRef.mainSchema;
	},
	uri: /*#__PURE__*/ v.resourceUriString(),
});

type commentView$schematype = typeof _commentViewSchema;

export interface commentViewSchema extends commentView$schematype {}

export const commentViewSchema = _commentViewSchema as commentViewSchema;

export interface CommentView extends v.InferInput<typeof commentViewSchema> {}
