import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.repo.getRecord', {
	params: /*#__PURE__*/ v.object({
		cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
		collection: /*#__PURE__*/ v.nsidString(),
		repo: /*#__PURE__*/ v.actorIdentifierString(),
		rkey: /*#__PURE__*/ v.recordKeyString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			cid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.cidString()),
			uri: /*#__PURE__*/ v.resourceUriString(),
			value: /*#__PURE__*/ v.unknown(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.getRecord': mainSchema;
	}
}
