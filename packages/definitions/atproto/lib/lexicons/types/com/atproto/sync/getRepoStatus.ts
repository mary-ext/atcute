import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.getRepoStatus', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.didString(),
			active: /*#__PURE__*/ v.boolean(),
			status: /*#__PURE__*/ v.optional(
				/*#__PURE__*/ v.string<
					| 'takendown'
					| 'suspended'
					| 'deleted'
					| 'deactivated'
					| 'desynchronized'
					| 'throttled'
					| (string & {})
				>(),
			),
			rev: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.tidString()),
		}),
	},
});
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getRepoStatus': mainSchema.$schema;
	}
}
