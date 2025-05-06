import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.getBlocks', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
		cids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'blob',
	},
});

type main$schematype = typeof _mainSchema;

/** @deprecated */
export interface main$schema extends main$schematype {}

export const mainSchema = _mainSchema as main$schema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getBlocks': main$schema;
	}
}
