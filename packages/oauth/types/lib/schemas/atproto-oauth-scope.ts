import * as v from 'valibot';

import { isOAuthScope } from './oauth-scope.ts';
import { isSpaceSeparatedValue } from './utils.ts';

export const ATPROTO_SCOPE_VALUE = 'atproto';

const isAtprotoOAuthScope = (input: string): boolean => {
	return isOAuthScope(input) && isSpaceSeparatedValue(ATPROTO_SCOPE_VALUE, input);
};

/** atproto OAuth scope (must include "atproto") */
export const atprotoOAuthScopeSchema = v.pipe(
	v.string(),
	v.check(isAtprotoOAuthScope, `invalid atproto OAuth scope`),
);

export type AtprotoOAuthScope = v.InferOutput<typeof atprotoOAuthScopeSchema>;

/** default scope is for reading identity (did) only */
export const DEFAULT_ATPROTO_OAUTH_SCOPE: AtprotoOAuthScope = ATPROTO_SCOPE_VALUE;
