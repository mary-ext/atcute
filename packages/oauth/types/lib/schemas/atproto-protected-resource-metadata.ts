import * as v from 'valibot';

import { oauthProtectedResourceMetadataValidator } from './oauth-protected-resource-metadata.ts';

/**
 * AT Protocol protected resource metadata with required fields.
 *
 * @see {@link https://atproto.com/specs/oauth}
 */
export const atprotoProtectedResourceMetadataValidator = v.pipe(
	oauthProtectedResourceMetadataValidator,
	v.forward(
		v.check(
			(data) => data.authorization_servers?.length === 1,
			`atproto requires exactly one authorization server`,
		),
		['authorization_servers'],
	),
	v.transform((data) => data as typeof data & { authorization_servers: [string] }),
);

export type AtprotoProtectedResourceMetadata = v.InferOutput<
	typeof atprotoProtectedResourceMetadataValidator
>;
