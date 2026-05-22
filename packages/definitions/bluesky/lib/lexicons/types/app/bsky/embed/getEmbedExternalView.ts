import * as ComAtprotoRepoStrongRef from '@atcute/atproto/types/repo/strongRef';
import type {} from '@atcute/lexicons';
import type {} from '@atcute/lexicons/ambient';
import * as v from '@atcute/lexicons/validations';

import * as AppBskyEmbedExternal from './external.ts';

const _mainSchema = /*#__PURE__*/ v.query('app.bsky.embed.getEmbedExternalView', {
	params: /*#__PURE__*/ v.object({
		/**
		 * AT-URIs of any Atmosphere records that can be resolved and used to construct #externalView views.
		 * Example: a site.standard.document and optionally its associated site.standard.publication.
		 *
		 * @minLength 1
		 * @maxLength 4
		 */
		uris: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.array(/*#__PURE__*/ v.resourceUriString()), [
			/*#__PURE__*/ v.arrayLength(1, 4),
		]),
		/**
		 * The canonical web URL the embed represents (typically the URL the user pasted into the composer). Used
		 * as the returned view's `uri`. May be used for validation in the future.
		 */
		url: /*#__PURE__*/ v.genericUriString(),
	}),
	output: {
		type: 'lex',
		schema: /*#__PURE__*/ v.object({
			associatedRecords: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(/*#__PURE__*/ v.unknown())),
			/**
			 * StrongRefs (URI+CID) of the Atmosphere records that backed this view, suitable for embedding into a
			 * post's external.associatedRefs.
			 */
			get associatedRefs() {
				return /*#__PURE__*/ v.optional(/*#__PURE__*/ v.array(ComAtprotoRepoStrongRef.mainSchema));
			},
			/**
			 * Hydrated view of the embed. Present only when the resolved records back the requested URL and supply
			 * enough information to populate the required `viewExternal` fields. Omitted alongside the rest of the
			 * response when no records resolved or validation failed.
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
