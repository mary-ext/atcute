import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('chat.bsky.moderation.getActorMetadata', {
	params: /*#__PURE__*/ v.object({
		actor: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get day() {
				return metadataSchema;
			},
			get month() {
				return metadataSchema;
			},
			get all() {
				return metadataSchema;
			},
		}),
	},
});
const _metadataSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('chat.bsky.moderation.getActorMetadata#metadata')),
	messagesSent: /*#__PURE__*/ v.integer(),
	messagesReceived: /*#__PURE__*/ v.integer(),
	convos: /*#__PURE__*/ v.integer(),
	convosStarted: /*#__PURE__*/ v.integer(),
});

type main$schematype = typeof _mainSchema;
type metadata$schematype = typeof _metadataSchema;

export interface mainSchema extends main$schematype {}
export interface metadataSchema extends metadata$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const metadataSchema = _metadataSchema as metadataSchema;

export interface Metadata extends v.InferInput<typeof metadataSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'chat.bsky.moderation.getActorMetadata': mainSchema;
	}
}
