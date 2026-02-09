import * as v from '@badrap/valita';

import { isOAuthScope } from './oauth-scope.ts';
import { isSpaceSeparatedValue } from './utils.ts';

export const ATPROTO_SCOPE_VALUE = 'atproto';

const isAtprotoOAuthScope = (input: string): boolean => {
	return isOAuthScope(input) && isSpaceSeparatedValue(ATPROTO_SCOPE_VALUE, input);
};

/** atproto OAuth scope (must include "atproto") */
export const atprotoOAuthScopeSchema = v.string().assert(isAtprotoOAuthScope, `invalid atproto OAuth scope`);

export type AtprotoOAuthScope = v.Infer<typeof atprotoOAuthScopeSchema>;

/** default scope is for reading identity (did) only */
export const DEFAULT_ATPROTO_OAUTH_SCOPE: AtprotoOAuthScope = ATPROTO_SCOPE_VALUE;
