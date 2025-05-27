import type { DidDocument } from '@atcute/identity';
import type { AtprotoDid, Did, Handle } from '@atcute/lexicons/syntax';

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
