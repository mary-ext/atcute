import type { LexiconDoc } from '@atcute/lexicon-doc';
import type { AtprotoDid, Nsid } from '@atcute/lexicons/syntax';

export interface ResolveLexiconAuthorityOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface LexiconAuthorityResolver {
	resolve(nsid: Nsid, options?: ResolveLexiconAuthorityOptions): Promise<AtprotoDid>;
}

export interface ResolveLexiconRecordOptions {
	signal?: AbortSignal;
	noCache?: boolean;
}

export interface ResolvedSchema {
	/** AT-URI of the lexicon record */
	uri: string;
	/** CID of the lexicon record */
	cid: string;
	/** Parsed lexicon schema document */
	schema: LexiconDoc;
}
