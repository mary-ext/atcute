import * as v from '@badrap/valita';

import { oauthClientIdSchema } from './oauth-client-id.ts';
import { httpsUriSchema } from './uri.ts';
import { extractUrlPath, isHostnameIP } from './utils.ts';

/**
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-00.html}
 */
export const oauthClientIdDiscoverableSchema = v.string().chain((input, options) => {
	// first validate as base client ID
	const clientIdResult = oauthClientIdSchema.try(input, options);
	if (!clientIdResult.ok) {
		return clientIdResult;
	}

	// then validate as https URI
	const httpsResult = httpsUriSchema.try(input, options);
	if (!httpsResult.ok) {
		return httpsResult;
	}

	const url = new URL(input);

	if (url.username || url.password) {
		return v.err(`client ID must not contain credentials`);
	}

	if (url.hash) {
		return v.err(`client ID must not contain a fragment`);
	}

	if (url.pathname === '/') {
		return v.err(`client ID must contain a path component (e.g. "/client-metadata.json")`);
	}

	if (url.pathname.endsWith('/')) {
		return v.err(`client ID path must not end with a trailing slash`);
	}

	if (isHostnameIP(url.hostname)) {
		return v.err(`client ID hostname must not be an IP address`);
	}

	// URL constructor normalizes the URL, so we extract the path manually to
	// avoid normalization, then compare it to the normalized path to ensure
	// that the URL does not contain path traversal or other unexpected characters
	if (extractUrlPath(input) !== url.pathname) {
		return v.err(`client ID must be in canonical form ("${url.href}", got "${input}")`);
	}

	return v.ok(input);
});
