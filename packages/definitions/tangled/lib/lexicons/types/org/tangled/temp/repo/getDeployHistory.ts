import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _deploySchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.repo.getDeployHistory#deploy')),
	/** Branch the deploy built. */
	branch: /*#__PURE__*/ v.string(),
	/** Commit the deploy built. Empty for a config-change deploy, which builds the branch tip at deploy time. */
	commitSha: /*#__PURE__*/ v.string(),
	/** When the deploy finished. */
	createdAt: /*#__PURE__*/ v.datetimeString(),
	/** Directory within the repository the deploy built (e.g. '/' or '/docs'). */
	dir: /*#__PURE__*/ v.string(),
	/** Why the deploy failed. Empty when it succeeded. */
	error: /*#__PURE__*/ v.string(),
	/** Outcome of the deploy. */
	status: /*#__PURE__*/ v.string<'failure' | 'success' | (string & {})>(),
	/** What asked for the deploy: a site config change, a push to the deployed branch, or a manual redeploy. */
	trigger: /*#__PURE__*/ v.string<'config_change' | 'manual' | 'push' | (string & {})>(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.repo.getDeployHistory', {
	params: /*#__PURE__*/ v.object({
		/** DID of the repository as minted by the knot. */
		repoDid: /*#__PURE__*/ v.didString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			/**
			 * The 20 most recent deploys, newest first. Empty when the repository has never deployed.
			 *
			 * @maxLength 20
			 */
			get deploys() {
				return /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(deploySchema), [
					/*#__PURE__*/ v.arrayLength(0, 20),
				]);
			},
		}),
	},
});

type deploy$schematype = typeof _deploySchema;
type main$schematype = typeof _mainSchema;

export interface deploySchema extends deploy$schematype {}
export interface mainSchema extends main$schematype {}

export const deploySchema = _deploySchema as deploySchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Deploy extends v.InferInput<typeof deploySchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.repo.getDeployHistory': mainSchema;
	}
}
