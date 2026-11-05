import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as OrgTangledGitDefs from '../../git/defs.ts';

const _commitSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.git.listCommits#commit')),
	get author() {
		return OrgTangledGitDefs.signatureSchema;
	},
	get committer() {
		return OrgTangledGitDefs.signatureSchema;
	},
	get extraHeaders() {
		return /*#__PURE__*/ v.array(headerSchema);
	},
	message: /*#__PURE__*/ v.string(),
	oid: /*#__PURE__*/ v.string(),
	parents: /*#__PURE__*/ v.array(/*#__PURE__*/ v.string()),
	/**
	 * Set only when the commit's signature verifies against the key embedded in it. Says nothing about who owns
	 * that key.
	 */
	get signature() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.variant([sshSignatureSchema]));
	},
	get stat() {
		return /*#__PURE__*/ v.optional(OrgTangledGitDefs.diffStatSchema);
	},
	tree: /*#__PURE__*/ v.string(),
});
const _headerSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.git.listCommits#header')),
	key: /*#__PURE__*/ v.string(),
	value: /*#__PURE__*/ v.string(),
});
const _mainSchema = /*#__PURE__*/ v.query('org.tangled.temp.git.listCommits', {
	params: /*#__PURE__*/ v.object({
		/**
		 * Diff each commit against its first parent and include a line stat
		 *
		 * @default false
		 */
		includeStats: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
		/**
		 * Maximum number of commits to return
		 *
		 * @default 50
		 * @minimum 1
		 * @maximum 100
		 */
		limit: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.integer(), [/*#__PURE__*/ v.integerRange(1, 100)]),
			50,
		),
		/** Commit ids or `<commit>..<commit>` ranges */
		ranges: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.string())),
		/**
		 * DIDs of the repositories to read objects from
		 *
		 * @minLength 1
		 * @maxLength 2
		 */
		repos: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.didString()), [
			/*#__PURE__*/ v.arrayLength(1, 2),
		]),
		/**
		 * Number of matching commits to skip. A poor man's pagination.
		 *
		 * @default 0
		 * @minimum 0
		 */
		skip: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer(), 0),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			get commits() {
				return /*#__PURE__*/ v.array(commitSchema);
			},
		}),
	},
});
const _sshSignatureSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('org.tangled.temp.git.listCommits#sshSignature')),
	/** SHA256 fingerprint of the signing key, `SHA256:...` */
	fingerprint: /*#__PURE__*/ v.string(),
});

type commit$schematype = typeof _commitSchema;
type header$schematype = typeof _headerSchema;
type main$schematype = typeof _mainSchema;
type sshSignature$schematype = typeof _sshSignatureSchema;

export interface commitSchema extends commit$schematype {}
export interface headerSchema extends header$schematype {}
export interface mainSchema extends main$schematype {}
export interface sshSignatureSchema extends sshSignature$schematype {}

export const commitSchema = _commitSchema as commitSchema;
export const headerSchema = _headerSchema as headerSchema;
export const mainSchema = _mainSchema as mainSchema;
export const sshSignatureSchema = _sshSignatureSchema as sshSignatureSchema;

export interface Commit extends v.InferInput<typeof commitSchema> {}
export interface Header extends v.InferInput<typeof headerSchema> {}
export interface SshSignature extends v.InferInput<typeof sshSignatureSchema> {}

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'org.tangled.temp.git.listCommits': mainSchema;
	}
}
