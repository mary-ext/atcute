import * as v from 'valibot';

import { webUriSchema } from './uri.ts';

export const oauthIssuerIdentifierSchema = v.pipe(
	webUriSchema,
	// validate the issuer (MIX-UP attacks)
	v.check((input) => !input.endsWith('/'), `issuer URL must not end with a slash`),
	v.check((input) => {
		const url = new URL(input);
		return !(url.username || url.password);
	}, `issuer URL must not contain a username or password`),
	v.check((input) => {
		const url = new URL(input);
		return !(url.hash || url.search);
	}, `issuer URL must not contain a query or fragment`),
	v.check((input) => {
		const url = new URL(input);
		const canonicalValue = url.pathname === '/' ? url.origin : url.href;
		return input === canonicalValue;
	}, `issuer URL must be in the canonical form`),
);

export type OAuthIssuerIdentifier = v.InferOutput<typeof oauthIssuerIdentifierSchema>;
