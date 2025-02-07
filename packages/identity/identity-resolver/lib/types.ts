import type { AtprotoDid, Did, DidDocument, Handle } from '@atcute/identity';

export interface ResolveDidDocumentOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface DidDocumentResolver<TMethod extends string> {
	resolve(did: Did<TMethod>, options?: ResolveDidDocumentOptions): Promise<DidDocument>;
}

export interface ResolveHandleOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface HandleResolver {
	resolve(handle: Handle, options?: ResolveHandleOptions): Promise<AtprotoDid>;
}
