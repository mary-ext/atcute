import * as v from '@badrap/valita';

import { urlSchema } from './uri.js';

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9396#section-2 | RFC 9396, Section 2}
 */
export const oauthAuthorizationDetailSchema = v.object({
	type: v.string(),
	/**
	 * an array of strings representing the location of the resource or RS. these
	 * strings are typically URIs identifying the location of the RS.
	 */
	locations: v.array(urlSchema).optional(),
	/**
	 * an array of strings representing the kinds of actions to be taken at the
	 * resource.
	 */
	actions: v.array(v.string()).optional(),
	/**
	 * an array of strings representing the kinds of data being requested from the
	 * resource.
	 */
	datatypes: v.array(v.string()).optional(),
	/**
	 * a string identifier indicating a specific resource available at the API.
	 */
	identifier: v.string().optional(),
	/**
	 * an array of strings representing the types or levels of privilege being
	 * requested at the resource.
	 */
	privileges: v.array(v.string()).optional(),
});

export type OAuthAuthorizationDetail = v.Infer<typeof oauthAuthorizationDetailSchema>;

/**
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9396#section-2 | RFC 9396, Section 2}
 */
export const oauthAuthorizationDetailsSchema = v.array(oauthAuthorizationDetailSchema);

export type OAuthAuthorizationDetails = v.Infer<typeof oauthAuthorizationDetailsSchema>;
