import { LocalActorResolver } from '@atcute/identity-resolver';

import type { DefaultIdentityResolverOptions, IdentityResolver } from '../types/identity.js';

export type { DefaultIdentityResolverOptions };

/**
 * @deprecated use `LocalActorResolver` from `@atcute/identity-resolver` instead
 */
export const defaultIdentityResolver = (options: DefaultIdentityResolverOptions): IdentityResolver => {
	return new LocalActorResolver(options);
};
