import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as ToolsOzoneModerationDefs from './defs.ts';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.moderation.queryEvents', {
	params: /*#__PURE__*/ v.object({
		/** If specified, only events where all of these labels were added are returned */
		addedLabels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** If specified, only events where all of these tags were added are returned */
		addedTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** If specified, only events where the age assurance state matches the given value are returned */
		ageAssuranceState: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.string<'assured' | 'blocked' | 'pending' | 'reset' | 'unknown' | (string & {})>(),
		),
		/** If specified, only events where the batchId matches the given value are returned */
		batchId: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/**
		 * If specified, only events where the subject belongs to the given collections will be returned. When
		 * subjectType is set to 'account', this will be ignored.
		 *
		 * @maxLength 20
		 */
		collections: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()), [
				/*#__PURE__*/ v.arrayLength(0, 20),
			]),
		),
		/**
		 * If specified, only events with comments containing the keyword are returned. Apply || separator to use
		 * multiple keywords and match using OR condition.
		 */
		comment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** Retrieve events created after a given timestamp */
		createdAfter: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		/** Retrieve events created before a given timestamp */
		createdBefore: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
		createdBy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		cursor: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
		/** If true, only events with comments are returned */
		hasComment: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
		/**
		 * If true, events on all record types (posts, lists, profile etc.) or records from given 'collections'
		 * param, owned by the did are returned.
		 *
		 * @default false
		 */
		includeAllUserRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** If specified, only events where the modTool name matches any of the given values are returned */
		modTool: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		policies: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** If specified, only events where all of these labels were removed are returned */
		removedLabels: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** If specified, only events where all of these tags were removed are returned */
		removedTags: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		reportTypes: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * Sort direction for the events. Defaults to descending order of created at timestamp.
		 *
		 * @default 'desc'
		 */
		sortDirection: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literalEnum(['asc', 'desc']), 'desc'),
		subject: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
		/**
		 * If specified, only events where the subject is of the given type (account or record) will be returned.
		 * When this is set to 'account' the 'collections' parameter will be ignored. When includeAllUserRecords
		 * or subject is set, this will be ignored.
		 */
		subjectType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string<'account' | 'record' | (string & {})>()),
		/**
		 * The types of events (fully qualified string in the format of
		 * tools.ozone.moderation.defs#modEvent<name>) to filter by. If not specified, all events are returned.
		 */
		types: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/** If specified, only events where strikeCount value is set are returned. */
		withStrike: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean()),
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

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.moderation.queryEvents': mainSchema;
	}
}
