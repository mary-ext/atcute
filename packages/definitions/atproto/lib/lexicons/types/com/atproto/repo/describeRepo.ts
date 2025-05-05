import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('com.atproto.repo.describeRepo', {
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
export const mainSchema = _mainSchema as mainSchema.$schema;
export declare namespace mainSchema {
	export {};
	type $schematype = typeof _mainSchema;
	export interface $schema extends $schematype {}
}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'com.atproto.repo.describeRepo': mainSchema.$schema;
	}
}
