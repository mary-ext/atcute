import * as v from 'valibot';

import { atprotoOAuthScopeSchema } from './atproto-oauth-scope.ts';

const SINGLE_SCOPE_RE = /^[\x21\x23-\x5B\x5D-\x7E]+$/;

const singleScopeSchema = v.pipe(
	v.string(),
	v.check((input) => SINGLE_SCOPE_RE.test(input), `invalid OAuth scope`),
);

const hasNoDuplicates = <T>(arr: readonly T[]): boolean => {
	for (let i = 0, len = arr.length; i < len; i++) {
		for (let j = 0; j < i; j++) {
			if (arr[i] === arr[j]) {
				return false;
			}
		}
	}
	return true;
};

/**
 * OAuth scope - either:
 * - a space-separated string (must include "atproto")
 * - an array of scope strings ('atproto' is added automatically)
 */
export const scopeSchema = v.union([
	v.pipe(
		atprotoOAuthScopeSchema,
		v.check((input) => hasNoDuplicates(input.split(/\s+/)), `duplicate scope`),
	),
	v.pipe(
		v.array(singleScopeSchema),
		v.transform((input) => (input.includes('atproto') ? input : ['atproto', ...input])),
		v.check(hasNoDuplicates, `duplicate scope`),
	),
]);
