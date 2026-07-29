import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.repo.getSiteConfig', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository as minted by the knot. */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/** Site config for the repository. Absent if no site is configured. */
			get config() {
				return /*#__PURE__*/ v.optional(siteConfigSchema);
			},
		}),
	},
});
const _siteConfigSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.repo.getSiteConfig#siteConfig')),
	/** Branch to deploy from. */
	branch: /*#__PURE__*/ v.string(),
	/** Directory within the repository to deploy (e.g. '/' or '/docs'). */
	dir: /*#__PURE__*/ v.string(),
	/** Whether this repo serves as the index (root) for the domain. */
	isIndex: /*#__PURE__*/ v.boolean(),
});

type main$schematype = typeof _mainSchema;
type siteConfig$schematype = typeof _siteConfigSchema;

export interface mainSchema extends main$schematype {}
export interface siteConfigSchema extends siteConfig$schematype {}

export const mainSchema = _mainSchema as mainSchema;
export const siteConfigSchema = _siteConfigSchema as siteConfigSchema;

export interface SiteConfig extends v.InferInput<typeof siteConfigSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.repo.getSiteConfig': mainSchema;
	}
}
