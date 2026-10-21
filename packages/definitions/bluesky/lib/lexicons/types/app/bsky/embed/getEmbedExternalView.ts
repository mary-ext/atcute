import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyEmbedExternal from './external.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.embed.getEmbedExternalView', {
	params: /*#__PURE__*/ v.object({
		/**
		 * The canonical AT URI of the atproto record found on the webpage. When provided, takes precedence over
		 * `uris`, which is then ignored.
		 */
		canonicalUri: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.resourceUriString()),
		/**
		 * Legacy input for Standard.site callers, ignored when `canonicalUri` is provided. A single record is
		 * selected from it: the first site.standard.document URI, otherwise the first site.standard.publication
		 * URI. Other entries are ignored; a document's publication is discovered from the document itself.
		 *
		 * @maxLength 4
		 */
		uris: /*#__PURE__*/ v.optional(
			/*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()), [
				/*#__PURE__*/ v.arrayLength(0, 4),
			]),
		),
		/**
		 * The canonical web URL the embed represents (typically the URL the user pasted into the composer). Used
		 * as the returned view's `uri`, and validated against the resolved records.
		 */
		url: /*#__PURE__*/ v.genericUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			associatedRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown())),
			/**
			 * StrongRefs (URI+CID) of the Atmosphere records selected for persistence in a post, suitable for
			 * embedding into its external.associatedRefs: the canonical record, plus only the additional records
			 * the service chooses to persist for its collection. This can be a subset of the records used to render
			 * `data`, which may also draw on other hydrated records such as recommendations, subscriptions, or
			 * favorites. Present only when validation passed. Index-aligned with `associatedRecords`.
			 */
			get associatedRefs() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
			},
			/**
			 * Preferred to #view. Hydrated data of the embed. Present only when validation passed and the records
			 * supply enough information to populate the required fields.
			 */
			get data() {
				return /*#__PURE__*/ v.optional(
					/*#__PURE__*/ v.variant([
						AppBskyEmbedExternal.viewArticleSchema,
						AppBskyEmbedExternal.viewArticlePublicationSchema,
						AppBskyEmbedExternal.viewGallerySchema,
						AppBskyEmbedExternal.viewLivestreamSchema,
					]),
				);
			},
			unverifiedAssociatedRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown())),
			/**
			 * StrongRefs (URI+CID) of the same persistence-selected Atmosphere records (the canonical record plus
			 * chosen additional records) when validation of the requested `url` failed. These must not be written
			 * to a post. Index-aligned with `unverifiedAssociatedRecords`.
			 */
			get unverifiedAssociatedRefs() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
			},
			/**
			 * Legacy hydrated view of the embed, returned for Standard.site records only. Present only when
			 * validation passed and the records supply enough information to populate the required `viewExternal`
			 * fields.
			 */
			get view() {
				return /*#__PURE__*/ v.optional(AppBskyEmbedExternal.viewSchema);
			},
		}),
	},
});

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface $params extends v.InferInput<mainSchema['params']> {}
export interface $output extends v.InferXRPCBodyInput<mainSchema['output']> {}

declare module '@atcute/lexicons/ambient' {
	interface XRPCQueries {
		'app.bsky.embed.getEmbedExternalView': mainSchema;
	}
}
