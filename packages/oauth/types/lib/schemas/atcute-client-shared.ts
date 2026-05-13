import * as v from 'valibot';

import { atprotoOAuthScopeSchema } from './atproto-oauth-scope.ts';
import { isLastOccurrence } from './utils.ts';

const SINGLE_SCOPE_RE = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

const singleScopeSchema = v.pipe(v.string(), v.regex(SINGLE_SCOPE_RE, `invalid OAuth scope`));

/**
 * OAuth scope - either: - a space-separated string (must include "atproto") - an array of scope strings
 * ('atproto' is added automatically)
 */
export const scopeSchema = v.union([
	v.pipe(
		atprotoOAuthScopeSchema,
		v.check((input) => input.split(/\s+/).every(isLastOccurrence), `duplicate scope`),
	),
	v.pipe(
		v.array(singleScopeSchema),
		v.transform((input) => (input.includes('atproto') ? input : ['atproto', ...input])),
		v.checkItems(isLastOccurrence, `duplicate scope`),
	),
]);
