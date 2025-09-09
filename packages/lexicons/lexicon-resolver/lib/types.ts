import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';

export interface ResolveLexiconAuthorityOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface LexiconAuthorityResolver {
	resolve(nsid: Nsid, options?: ResolveLexiconAuthorityOptions): Promise<AtprotoDid>;
}
