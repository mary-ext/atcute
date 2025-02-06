import type { Did, DidDocument, Handle } from '@atcute/identity';

export interface ResolveDidOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface DidResolver<TMethod extends string> {
	resolve(did: Did<TMethod>, options?: ResolveDidOptions): Promise<DidDocument>;
}

export interface ResolveHandleOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface HandleResolver {
	resolve(handle: Handle, options?: ResolveHandleOptions): Promise<Did>;
}
