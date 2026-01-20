import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _commitCountBreakdownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.refUpdate#commitCountBreakdown')),
	get byEmail() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(individualEmailCommitCountSchema));
	},
});
const _individualEmailCommitCountSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(
		/*#__PURE__*/ v.literal('sh.tangled.git.refUpdate#individualEmailCommitCount'),
	),
	count: /*#__PURE__*/ v.integer(),
	email: /*#__PURE__*/ v.string(),
});
const _individualLanguageSizeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.refUpdate#individualLanguageSize')),
	lang: /*#__PURE__*/ v.string(),
	size: /*#__PURE__*/ v.integer(),
});
const _langBreakdownSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.refUpdate#langBreakdown')),
	get inputs() {
		return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(individualLanguageSizeSchema));
	},
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.tidString(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('sh.tangled.git.refUpdate'),
		/**
		 * did of the user that pushed this ref
		 */
		committerDid: /*#__PURE__*/ v.didString(),
		get meta() {
			return metaSchema;
		},
		/**
		 * new SHA of this ref
		 * @minLength 40
		 * @maxLength 40
		 */
		newSha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
		/**
		 * old SHA of this ref
		 * @minLength 40
		 * @maxLength 40
		 */
		oldSha: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [/*#__PURE__*/ v.stringLength(40, 40)]),
		/**
		 * Ref being updated
		 * @maxLength 2560
		 * @maxGraphemes 256
		 */
		ref: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
			/*#__PURE__*/ v.stringLength(0, 2560),
			/*#__PURE__*/ v.stringGraphemes(0, 256),
		]),
		/**
		 * did of the owner of the repo
		 */
		repoDid: /*#__PURE__*/ v.didString(),
		/**
		 * name of the repo
		 */
		repoName: /*#__PURE__*/ v.string(),
	}),
);
const _metaSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('sh.tangled.git.refUpdate#meta')),
	get commitCount() {
		return commitCountBreakdownSchema;
	},
	/**
	 * @default false
	 */
	isDefaultRef: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.boolean(), false),
	get langBreakdown() {
		return /*#__PURE__*/ v.optional(langBreakdownSchema);
	},
});

type commitCountBreakdown$schematype = typeof _commitCountBreakdownSchema;
type individualEmailCommitCount$schematype = typeof _individualEmailCommitCountSchema;
type individualLanguageSize$schematype = typeof _individualLanguageSizeSchema;
type langBreakdown$schematype = typeof _langBreakdownSchema;
type main$schematype = typeof _mainSchema;
type meta$schematype = typeof _metaSchema;

export interface commitCountBreakdownSchema extends commitCountBreakdown$schematype {}
export interface individualEmailCommitCountSchema extends individualEmailCommitCount$schematype {}
export interface individualLanguageSizeSchema extends individualLanguageSize$schematype {}
export interface langBreakdownSchema extends langBreakdown$schematype {}
export interface mainSchema extends main$schematype {}
export interface metaSchema extends meta$schematype {}

export const commitCountBreakdownSchema = _commitCountBreakdownSchema as commitCountBreakdownSchema;
export const individualEmailCommitCountSchema =
	_individualEmailCommitCountSchema as individualEmailCommitCountSchema;
export const individualLanguageSizeSchema = _individualLanguageSizeSchema as individualLanguageSizeSchema;
export const langBreakdownSchema = _langBreakdownSchema as langBreakdownSchema;
export const mainSchema = _mainSchema as mainSchema;
export const metaSchema = _metaSchema as metaSchema;

export interface CommitCountBreakdown extends v.InferInput<typeof commitCountBreakdownSchema> {}
export interface IndividualEmailCommitCount extends v.InferInput<typeof individualEmailCommitCountSchema> {}
export interface IndividualLanguageSize extends v.InferInput<typeof individualLanguageSizeSchema> {}
export interface LangBreakdown extends v.InferInput<typeof langBreakdownSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Meta extends v.InferInput<typeof metaSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'sh.tangled.git.refUpdate': mainSchema;
	}
}
