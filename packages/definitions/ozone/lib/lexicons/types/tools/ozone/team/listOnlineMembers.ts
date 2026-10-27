import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('tools.ozone.team.listOnlineMembers', {
	params: /*#__PURE__*/ v.object({
		/**
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** @maxLength 100 */
			get members() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(onlineMemberSchema), [
					/*#__PURE__*/ v.arrayLength(0, 100),
				]);
			},
		}),
	},
});
const _onlineMemberSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.team.listOnlineMembers#onlineMember')),
	did: /*#__PURE__*/ v.didString(),
	lastActive: /*#__PURE__*/ v.datetimeString(),
});

type main$schematype = typeof _mainSchema;
type onlineMember$schematype = typeof _onlineMemberSchema;

export interface mainSchema extends main$schematype {}
export interface onlineMemberSchema extends onlineMember$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const onlineMemberSchema = _onlineMemberSchema as onlineMemberSchema;

export interface OnlineMember extends v.InferInput<typeof onlineMemberSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.team.listOnlineMembers': mainSchema;
	}
}
