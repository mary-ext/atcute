import type { DidDocument } from '@atcute/identity';
import type { ActorIdentifier, AtprotoDid, Did, Handle } from '@atcute/lexicons/syntax';

export interface ResolveDidDocumentOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface DidDocumentResolver<TMethod extends string = string> {
	resolve(did: Did<TMethod>, options?: ResolveDidDocumentOptions): Promise<DidDocument>;
}

export interface ResolveHandleOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface HandleResolver {
	resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid>;
}

export interface ResolveActorOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface ResolvedActor {
	did: Did;
	handle: Handle;
	pds: string;
}

export interface ActorResolver {
	resolve(actor: ActorIdentifier, options?: ResolveActorOptions): Promise<ResolvedActor>;
}
