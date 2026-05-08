import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

const _collectionScopeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.preference.ai#collectionScope')),
	/**
	 * NSID of the collection this override applies to.
	 */
	collection: /*#__PURE__*/ v.nsidString(),
});
const _entityScopeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.preference.ai#entityScope')),
	/**
	 * DID or domain of the entity this override applies to.
	 */
	entity: /*#__PURE__*/ v.string(),
});
const _globalScopeSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.preference.ai#globalScope')),
});
const _mainSchema = /*#__PURE__*/ v.record(
	/*#__PURE__*/ v.string(),
	/*#__PURE__*/ v.object({
		$type: /*#__PURE__*/ v.literal('community.lexicon.preference.ai'),
		get preferences() {
			return preferenceSetSchema;
		},
		/**
		 * What this record's preferences apply to.
		 */
		get scope() {
			return /*#__PURE__*/ v.variant([collectionScopeSchema, entityScopeSchema, globalScopeSchema]);
		},
		/**
		 * Timestamp of the most recent change to this record.
		 */
		updatedAt: /*#__PURE__*/ v.datetimeString(),
	}),
);
const _preferenceSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.preference.ai#preference')),
	/**
	 * Whether this usage is permitted (true) or denied (false).
	 */
	allow: /*#__PURE__*/ v.boolean(),
	/**
	 * When this specific preference was last changed.
	 */
	updatedAt: /*#__PURE__*/ v.datetimeString(),
});
const _preferenceSetSchema = /*#__PURE__*/ v.object({
	$type: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.literal('community.lexicon.preference.ai#preferenceSet')),
	/**
	 * Use for vector embeddings or semantic indexing.
	 */
	get embedding() {
		return /*#__PURE__*/ v.optional(preferenceSchema);
	},
	/**
	 * Use at inference time for retrieval, RAG, or context injection.
	 */
	get inference() {
		return /*#__PURE__*/ v.optional(preferenceSchema);
	},
	/**
	 * Use to generate synthetic content or interactions derived from user data.
	 */
	get syntheticContent() {
		return /*#__PURE__*/ v.optional(preferenceSchema);
	},
	/**
	 * Use as input for training, fine-tuning, distillation, or RLHF of ML models.
	 */
	get training() {
		return /*#__PURE__*/ v.optional(preferenceSchema);
	},
});

type collectionScope$schematype = typeof _collectionScopeSchema;
type entityScope$schematype = typeof _entityScopeSchema;
type globalScope$schematype = typeof _globalScopeSchema;
type main$schematype = typeof _mainSchema;
type preference$schematype = typeof _preferenceSchema;
type preferenceSet$schematype = typeof _preferenceSetSchema;

export interface collectionScopeSchema extends collectionScope$schematype {}
export interface entityScopeSchema extends entityScope$schematype {}
export interface globalScopeSchema extends globalScope$schematype {}
export interface mainSchema extends main$schematype {}
export interface preferenceSchema extends preference$schematype {}
export interface preferenceSetSchema extends preferenceSet$schematype {}

export const collectionScopeSchema = _collectionScopeSchema as collectionScopeSchema;
export const entityScopeSchema = _entityScopeSchema as entityScopeSchema;
export const globalScopeSchema = _globalScopeSchema as globalScopeSchema;
export const mainSchema = _mainSchema as mainSchema;
export const preferenceSchema = _preferenceSchema as preferenceSchema;
export const preferenceSetSchema = _preferenceSetSchema as preferenceSetSchema;

export interface CollectionScope extends v.InferInput<typeof collectionScopeSchema> {}
export interface EntityScope extends v.InferInput<typeof entityScopeSchema> {}
export interface GlobalScope extends v.InferInput<typeof globalScopeSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface Preference extends v.InferInput<typeof preferenceSchema> {}
export interface PreferenceSet extends v.InferInput<typeof preferenceSetSchema> {}

declare module '@atcute/lexicons/ambient' {
	interface Records {
		'community.lexicon.preference.ai': mainSchema;
	}
}
