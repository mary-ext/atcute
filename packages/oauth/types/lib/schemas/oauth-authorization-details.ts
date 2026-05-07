import * as v from 'valibot';

import { urlSchema } from './uri.ts';

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9396#section-2 | RFC 9396, Section 2}
 */
export const oauthAuthorizationDetailSchema = v.looseObject({
	type: v.string(),
	/**
	 * an array of strings representing the location of the resource or RS. these
	 * strings are typically URIs identifying the location of the RS.
	 */
	locations: v.optional(v.array(urlSchema)),
	/**
	 * an array of strings representing the kinds of actions to be taken at the
	 * resource.
	 */
	actions: v.optional(v.array(v.string())),
	/**
	 * an array of strings representing the kinds of data being requested from the
	 * resource.
	 */
	datatypes: v.optional(v.array(v.string())),
	/**
	 * a string identifier indicating a specific resource available at the API.
	 */
	identifier: v.optional(v.string()),
	/**
	 * an array of strings representing the types or levels of privilege being
	 * requested at the resource.
	 */
	privileges: v.optional(v.array(v.string())),
});

export type OAuthAuthorizationDetail = v.InferOutput<typeof oauthAuthorizationDetailSchema>;

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9396#section-2 | RFC 9396, Section 2}
 */
export const oauthAuthorizationDetailsSchema = v.array(oauthAuthorizationDetailSchema);

export type OAuthAuthorizationDetails = v.InferOutput<typeof oauthAuthorizationDetailsSchema>;
