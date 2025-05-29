import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _feedSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.describeFeedGenerator#feed')),
	uri: /*#__PURE__*/ v.resourceUriString(),
});
const _linksSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('app.bsky.feed.describeFeedGenerator#links')),
	privacyPolicy: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
	termsOfService: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _mainSchema = /*#__PURE__*/ v.query('app.bsky.feed.describeFeedGenerator', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			did: /*#__PURE__*/ v.didString(),
			get feeds() {
				return /*#__PURE__*/ v.array(feedSchema);
			},
			get links() {
				return /*#__PURE__*/ v.optional(linksSchema);
			},
		}),
	},
});

type feed$schematype = typeof _feedSchema;
type links$schematype = typeof _linksSchema;
type main$schematype = typeof _mainSchema;

export interface feedSchema extends feed$schematype {}
export interface linksSchema extends links$schematype {}
export interface mainSchema extends main$schematype {}

export const feedSchema = _feedSchema as feedSchema;
export const linksSchema = _linksSchema as linksSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Feed extends v.InferInput<typeof feedSchema> {}
export interface Links extends v.InferInput<typeof linksSchema> {}

export interface $params {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.feed.describeFeedGenerator': mainSchema;
	}
}
