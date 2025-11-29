import type {
	ActorResolver,
	LocalActorResolverOptions,
	ResolveActorOptions,
	ResolvedActor,
} from '@atcute/identity-resolver';

// re-export types for backward compatibility
export type IdentityResolver = ActorResolver;
export type ResolvedIdentity = ResolvedActor;
export type ResolveIdentityOptions = ResolveActorOptions;
export type { LocalActorResolverOptions as DefaultIdentityResolverOptions };
