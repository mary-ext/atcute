import * as v from 'valibot';

import { oauthClientIdSchema } from './oauth-client-id.ts';
import { httpsUriSchema } from './uri.ts';
import { extractUrlPath, isHostnameIP } from './utils.ts';

/**
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-00.html}
 */
export const oauthClientIdDiscoverableSchema = v.pipe(
	oauthClientIdSchema,
	httpsUriSchema,
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}
		const input = dataset.value;
		const url = new URL(input);

		if (url.username || url.password) {
			addIssue({ message: `client ID must not contain credentials` });
			return;
		}
		if (url.hash) {
			addIssue({ message: `client ID must not contain a fragment` });
			return;
		}
		if (url.pathname === '/') {
			addIssue({ message: `client ID must contain a path component (e.g. "/client-metadata.json")` });
			return;
		}
		if (url.pathname.endsWith('/')) {
			addIssue({ message: `client ID path must not end with a trailing slash` });
			return;
		}
		if (isHostnameIP(url.hostname)) {
			addIssue({ message: `client ID hostname must not be an IP address` });
			return;
		}

		// URL constructor normalizes the URL, so we extract the path manually to avoid
		// normalization, then compare it to the normalized path to ensure that the URL does not
		// contain path traversal or other unexpected characters
		if (extractUrlPath(input) !== url.pathname) {
			addIssue({ message: `client ID must be in canonical form ("${url.href}", got "${input}")` });
		}
	}),
);
