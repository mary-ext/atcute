import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.sync.getRecord', {
	params: /*#__PURE__*/ v.object({
		did: /*#__PURE__*/ v.didString(),
		collection: /*#__PURE__*/ v.nsidString(),
		rkey: /*#__PURE__*/ v.recordKeyString(),
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
		'com.atproto.sync.getRecord': main$schema;
	}
}
