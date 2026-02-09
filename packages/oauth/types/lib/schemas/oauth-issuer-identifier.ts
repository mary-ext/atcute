import * as v from '@badrap/valita';

import { webUriSchema } from './uri.ts';

export const oauthIssuerIdentifierSchema = webUriSchema.chain((input) => {
	// validate the issuer (MIX-UP attacks)

	if (input.endsWith('/')) {
		return v.err(`issuer URL must not end with a slash`);
	}

	const url = new URL(input);

	if (url.username || url.password) {
		return v.err(`issuer URL must not contain a username or password`);
	}

	if (url.hash || url.search) {
		return v.err(`issuer URL must not contain a query or fragment`);
	}

	const canonicalValue = url.pathname === '/' ? url.origin : url.href;
	if (input !== canonicalValue) {
		return v.err(`issuer URL must be in the canonical form`);
	}

	return v.ok(input);
});

export type OAuthIssuerIdentifier = v.Infer<typeof oauthIssuerIdentifierSchema>;
