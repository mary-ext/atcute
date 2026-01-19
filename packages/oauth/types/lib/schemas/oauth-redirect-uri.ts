import * as v from '@badrap/valita';

import { httpsUriSchema, loopbackUriSchema, privateUseUriSchema } from './uri.js';

/**
 * this is a loopback URI with the additional restriction that the hostname
 * `localhost` is not allowed.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8252#section-8.3 Loopback Redirect Considerations} RFC8252
 *
 * > While redirect URIs using localhost (i.e.,
 * > "http://localhost:{port}/{path}") function similarly to loopback IP
 * > redirects described in Section 7.3, the use of localhost is NOT
 * > RECOMMENDED. Specifying a redirect URI with the loopback IP literal rather
 * > than localhost avoids inadvertently listening on network interfaces other
 * > than the loopback interface. It is also less susceptible to client-side
 * > firewalls and misconfigured host name resolution on the user's device.
 */
export const loopbackRedirectUriSchema = loopbackUriSchema.chain((input) => {
	if (input.startsWith('http://localhost')) {
		return v.err(
			`use of "localhost" hostname is not allowed (RFC 8252), use a loopback IP such as "127.0.0.1" instead`,
		);
	}
	return v.ok(input);
});

export type LoopbackRedirectUri = v.Infer<typeof loopbackRedirectUriSchema>;

export const oauthRedirectUriSchema = v.string().chain((input, options) => {
	if (input.startsWith('http://')) {
		return loopbackRedirectUriSchema.try(input, options);
	}

	if (input.startsWith('https://')) {
		return httpsUriSchema.try(input, options);
	}

	return privateUseUriSchema.try(input, options);
});

export type OAuthRedirectUri = v.Infer<typeof oauthRedirectUriSchema>;
