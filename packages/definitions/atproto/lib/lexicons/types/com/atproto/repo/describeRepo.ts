import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.query('com.atproto.repo.describeRepo', {
	params: /*#__PURE__*/ v.object({
		repo: /*#__PURE__*/ v.actorIdentifierString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			handle: /*#__PURE__*/ v.handleString(),
			did: /*#__PURE__*/ v.didString(),
			didDoc: /*#__PURE__*/ v.unknown(),
			collections: /*#__PURE__*/ v.array(/*#__PURE__*/ v.nsidString()),
			handleIsCorrect: /*#__PURE__*/ v.boolean(),
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.describeRepo': mainSchema;
	}
}
