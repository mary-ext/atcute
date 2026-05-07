import * as v from 'valibot';

import {
	oauthProtectedResourceMetadataValidator,
	type OAuthProtectedResourceMetadata,
} from './oauth-protected-resource-metadata.ts';

export type AtprotoProtectedResourceMetadata = OAuthProtectedResourceMetadata & {
	authorization_servers: [string];
};

/**
 * AT Protocol protected resource metadata with required fields.
 *
 * @see {@link https://atproto.com/specs/oauth}
 */
export const atprotoProtectedResourceMetadataValidator: v.GenericSchema<
	unknown,
	AtprotoProtectedResourceMetadata
> = v.pipe(
	oauthProtectedResourceMetadataValidator,
	v.forward(
		v.check(
			(data) => data.authorization_servers?.length === 1,
			`atproto requires exactly one authorization server`,
		),
		['authorization_servers'],
	),
) as unknown as v.GenericSchema<unknown, AtprotoProtectedResourceMetadata>;
