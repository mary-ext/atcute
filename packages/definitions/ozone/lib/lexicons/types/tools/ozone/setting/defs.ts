import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _optionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.setting.defs#option')),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	createdBy: /*#__PURE__*/ v.didString(),
	/**
	 * @maxLength 10240
	 * @maxGraphemes 1024
	 */
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10240),
			/*#__PURE__*/ v.stringGraphemes(0, 1024),
		]),
	),
	did: /*#__PURE__*/ v.didString(),
	key: /*#__PURE__*/ v.nsidString(),
	lastUpdatedBy: /*#__PURE__*/ v.didString(),
	managerRole: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'tools.ozone.team.defs#roleAdmin'
			| 'tools.ozone.team.defs#roleModerator'
			| 'tools.ozone.team.defs#roleTriage'
			| 'tools.ozone.team.defs#roleVerifier'
			| (string & {})
		>(),
	),
	scope: /*#__PURE__*/ v.string<'instance' | 'personal' | (string & {})>(),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	value: /*#__PURE__*/ v.unknown(),
});

type option$schematype = typeof _optionSchema;

export interface optionSchema extends option$schematype {}

export const optionSchema = _optionSchema as optionSchema;

export interface Option extends v.InferInput<typeof optionSchema> {}
