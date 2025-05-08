import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.xrpcQuery('tools.ozone.server.getConfig', {
	params: null,
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get appview() {
				return /*#__PURE__*/ v.optional(serviceConfigSchema);
			},
			get pds() {
				return /*#__PURE__*/ v.optional(serviceConfigSchema);
			},
			get blobDivert() {
				return /*#__PURE__*/ v.optional(serviceConfigSchema);
			},
			get chat() {
				return /*#__PURE__*/ v.optional(serviceConfigSchema);
			},
			get viewer() {
				return /*#__PURE__*/ v.optional(viewerConfigSchema);
			},
			verifierDid: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.didString()),
		}),
	},
});
const _serviceConfigSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.server.getConfig#serviceConfig')),
	url: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
});
const _viewerConfigSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('tools.ozone.server.getConfig#viewerConfig')),
	role: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.string<
			| 'tools.ozone.team.defs#roleAdmin'
			| 'tools.ozone.team.defs#roleModerator'
			| 'tools.ozone.team.defs#roleTriage'
			| 'tools.ozone.team.defs#roleVerifier'
			| (string & {})
		>(),
	),
});

type main$schematype = typeof _mainSchema;
type serviceConfig$schematype = typeof _serviceConfigSchema;
type viewerConfig$schematype = typeof _viewerConfigSchema;

export interface mainSchema extends main$schematype {}
export interface serviceConfigSchema extends serviceConfig$schematype {}
export interface viewerConfigSchema extends viewerConfig$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const serviceConfigSchema = _serviceConfigSchema as serviceConfigSchema;
export const viewerConfigSchema = _viewerConfigSchema as viewerConfigSchema;

export interface ServiceConfig extends v.InferInput<typeof serviceConfigSchema> {}
export interface ViewerConfig extends v.InferInput<typeof viewerConfigSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'tools.ozone.server.getConfig': mainSchema;
	}
}
