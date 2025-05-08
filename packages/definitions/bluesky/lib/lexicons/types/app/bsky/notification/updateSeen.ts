import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcProcedure('app.bsky.notification.updateSeen', {
	params: null,
	input: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			seenAt: /*#__PURE__*/ v.datetimeString(),
		}),
	},
	output: null,
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCProcedures {
		'app.bsky.notification.updateSeen': mainSchema;
	}
}
