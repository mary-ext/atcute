import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('pub.leaflet.blocks.membersOnlyDelimiter')),
	/** Whether access is available to all subscribers, all paid members, or selected paid tiers. */
	audience: /*#__PURE__*/ v.string<'paid' | 'subscribers' | 'tiers' | (string & {})>(),
	/** Paid tier ids that grant access when audience is tiers. An empty selection grants no membership access. */
	tierIds: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}
