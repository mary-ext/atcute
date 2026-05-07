import * as v from 'valibot';

import { webUriSchema } from './uri.ts';

export const oauthIssuerIdentifierSchema = v.pipe(
	webUriSchema,
	// validate the issuer (MIX-UP attacks)
	v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed) {
			return;
		}
		const input = dataset.value;

		if (input.endsWith('/')) {
			addIssue({ message: `issuer URL must not end with a slash` });
			return;
		}

		const url = new URL(input);

		if (url.username || url.password) {
			addIssue({ message: `issuer URL must not contain a username or password` });
			return;
		}

		if (url.hash || url.search) {
			addIssue({ message: `issuer URL must not contain a query or fragment` });
			return;
		}

		const canonicalValue = url.pathname === '/' ? url.origin : url.href;
		if (input !== canonicalValue) {
			addIssue({ message: `issuer URL must be in the canonical form` });
		}
	}),
);

export type OAuthIssuerIdentifier = v.InferOutput<typeof oauthIssuerIdentifierSchema>;
