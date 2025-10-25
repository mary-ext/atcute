import type { ActorIdentifier, Did, Handle } from '@atcute/lexicons';

export interface ResolvedIdentity {
	did: Did;
	handle: Handle;
	pds: string;
}

export interface ResolveIdentityOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface IdentityResolver {
	resolve(actor: ActorIdentifier, options?: ResolveIdentityOptions): Promise<ResolvedIdentity>;
}
