import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';
import * as BlueMojiPacksDefs from './defs.js';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('blue.moji.packs.getPacks', {
	params: /*#__PURE__*/ v.object({
		uris: /*#__PURE__*/ v.constrain(v.array(/*#__PURE__*/ v.resourceUriString()), [
			/*#__PURE__*/ v.arrayLength(0, 25),
		]),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get packs() {
				return /*#__PURE__*/ v.array(BlueMojiPacksDefs.packViewBasicSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'blue.moji.packs.getPacks': mainSchema;
	}
}
