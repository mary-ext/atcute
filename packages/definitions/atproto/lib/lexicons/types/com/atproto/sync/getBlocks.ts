import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.sync.getBlocks', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
		cids: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	}),
	output: {
		type: 'blob',
		encoding: ['application/vnd.ipld.car'],
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.sync.getBlocks': mainSchema;
	}
}
