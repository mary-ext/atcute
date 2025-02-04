import type { Did, DidDocument } from '@atcute/did';

export interface ResolveDidOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface DidResolver<TMethod extends string> {
	resolve(did: Did<TMethod>, options?: ResolveDidOptions): Promise<DidDocument>;
}
