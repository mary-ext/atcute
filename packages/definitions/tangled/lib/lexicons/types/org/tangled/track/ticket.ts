import * as ComAtprotoLabelDefs from '@atcute/atproto/types/label/defs';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledLabelDefs from '../label/defs.ts';
import * as OrgTangledMarkupMarkdown from '../markup/markdown.ts';

import * as OrgTangledTrackDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('org.tangled.track.ticket'),
		assignees: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString())),
		get body() {
			return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([OrgTangledMarkupMarkdown.mainSchema]));
		},
		createdAt: /*#__PURE__*/ v.datetimeString(),
		/** Self-label values for this record. */
		get labels() {
			return /*#__PURE__*/ v.optional(ComAtprotoLabelDefs.selfLabelsSchema);
		},
		get state() {
			return OrgTangledTrackDefs.ticketStateSchema;
		},
		get tangledLabels() {
			return /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.array(/*#__PURE__*/ v.variant([OrgTangledLabelDefs.labelTokenSchema])),
			);
		},
		/**
		 * Target branch name. Must not include the `refs/heads/` prefix.
		 *
		 * @maxLength 244
		 */
		targetBranch: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 244)]),
		),
		get title() {
			return /*#__PURE__*/ v.variant([OrgTangledMarkupMarkdown.inlineSchema]);
		},
	}),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'org.tangled.track.ticket': mainSchema;
	}
}
