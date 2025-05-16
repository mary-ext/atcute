import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('chat.bsky.actor.exportAccountData', {
	params: null,
	output: {
		type: 'blob',
		encoding: ['application/jsonl'],
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'chat.bsky.actor.exportAccountData': mainSchema;
	}
}
