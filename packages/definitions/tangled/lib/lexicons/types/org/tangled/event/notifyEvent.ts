import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledCiTriggerManual from '../ci/trigger/manual.ts';

import * as OrgTangledEventPush from './push.ts';

const _ciOutputSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.event.notifyEvent#ciOutput')),
	/**
	 * Text returned by the server for this push, like how to follow a started CI.
	 *
	 * @maxLength 1000
	 */
	message: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(0, 1000)]),
	),
	/** IDs of the scheduled pipelines */
	pipelines: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.recordKeyString())),
});
const _mainSchema = /*#__PURE__*/ v.procedure('org.tangled.event.notifyEvent', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Tangled event object */
			get event() {
				return /*#__PURE__*/ v.variant([
					OrgTangledCiTriggerManual.mainSchema,
					OrgTangledEventPush.mainSchema,
				]);
			},
			/** Repository DID */
			repo: /*#__PURE__*/ v.didString(),
		}),
	},
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get ci() {
				return /*#__PURE__*/ v.optional(ciOutputSchema);
			},
		}),
	},
});

type ciOutput$schematype = typeof _ciOutputSchema;
type main$schematype = typeof _mainSchema;

export interface ciOutputSchema extends ciOutput$schematype {}
export interface mainSchema extends main$schematype {}

export const ciOutputSchema = _ciOutputSchema as ciOutputSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface CiOutput extends v.InferInput<typeof ciOutputSchema> {}

export interface $params {}
export interface $input extends v.InferXRPCBodyInput<mainSchema['input']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'org.tangled.event.notifyEvent': mainSchema;
	}
}
