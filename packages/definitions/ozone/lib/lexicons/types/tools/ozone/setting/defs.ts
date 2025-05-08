import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _optionSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.setting.defs#option')),
	key: /*#__PURE__*/ v.nsidString(),
	did: /*#__PURE__*/ v.didString(),
	value: /*#__PURE__*/ v.unknown(),
	description: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 10240),
			/*#__PURE__*/ v.stringGraphemes(0, 1024),
		]),
	),
	createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	updatedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
	managerRole: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'tools.ozone.team.defs#roleModerator'
			| 'tools.ozone.team.defs#roleTriage'
			| 'tools.ozone.team.defs#roleAdmin'
			| 'tools.ozone.team.defs#roleVerifier'
			| (string & {})
		>(),
	),
	scope: /*#__PURE__*/ v.string<'instance' | 'personal' | (string & {})>(),
	createdBy: /*#__PURE__*/ v.didString(),
	lastUpdatedBy: /*#__PURE__*/ v.didString(),
});

type option$schematype = typeof _optionSchema;

export interface optionSchema extends option$schematype {}

export const optionSchema = _optionSchema as optionSchema;

export interface Option extends v.InferInput<typeof optionSchema> {}
