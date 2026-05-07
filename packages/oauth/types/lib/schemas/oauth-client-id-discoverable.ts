import * as v from 'valibot';

import { oauthClientIdSchema } from './oauth-client-id.ts';
import { httpsUriSchema } from './uri.ts';
import { extractUrlPath, isHostnameIP } from './utils.ts';

/**
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-00.html}
 */
export const oauthClientIdDiscoverableSchema = v.pipe(
	v.string(),
	v.rawTransform<string, string>(({ dataset, addIssue, NEVER }) => {
		const input = dataset.value;

		// first validate as base client ID
		const clientIdResult = v.safeParse(oauthClientIdSchema, input);
		if (!clientIdResult.success) {
			for (const issue of clientIdResult.issues) {
				addIssue({ message: issue.message });
			}
			return NEVER;
		}

		// then validate as https URI
		const httpsResult = v.safeParse(httpsUriSchema, input);
		if (!httpsResult.success) {
			for (const issue of httpsResult.issues) {
				addIssue({ message: issue.message });
			}
			return NEVER;
		}

		const url = new URL(input);

		if (url.username || url.password) {
			addIssue({ message: `client ID must not contain credentials` });
			return NEVER;
		}

		if (url.hash) {
			addIssue({ message: `client ID must not contain a fragment` });
			return NEVER;
		}

		if (url.pathname === '/') {
			addIssue({ message: `client ID must contain a path component (e.g. "/client-metadata.json")` });
			return NEVER;
		}

		if (url.pathname.endsWith('/')) {
			addIssue({ message: `client ID path must not end with a trailing slash` });
			return NEVER;
		}

		if (isHostnameIP(url.hostname)) {
			addIssue({ message: `client ID hostname must not be an IP address` });
			return NEVER;
		}

		// URL constructor normalizes the URL, so we extract the path manually to
		// avoid normalization, then compare it to the normalized path to ensure
		// that the URL does not contain path traversal or other unexpected characters
		if (extractUrlPath(input) !== url.pathname) {
			addIssue({ message: `client ID must be in canonical form ("${url.href}", got "${input}")` });
			return NEVER;
		}

		return input;
	}),
);
