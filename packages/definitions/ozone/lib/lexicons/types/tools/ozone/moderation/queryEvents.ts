import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as ToolsOzoneModerationDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.queryEvents', {
	params: /*#__PURE__*/ v.object({
		types: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		createdBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		sortDirection: /*#__PURE__*/ v.literalEnum(['asc', 'desc']),
		createdAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		createdBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		collections: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.nsidString()), [/*#__PURE__*/ v.arrayLength(0, 20)]),
		),
		subjectType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'account' | 'record' | (string & {})>()),
		includeAllUserRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		hasComment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		addedLabels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		removedLabels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		addedTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		removedTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		policies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
			get events() {
				return /*#__PURE__*/ v.array(ToolsOzoneModerationDefs.modEventViewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.queryEvents': mainSchema;
	}
}
