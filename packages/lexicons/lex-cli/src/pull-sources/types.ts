import type { LexiconDoc } from '@atcute/lexicon-doc';

export interface SourceLocation {
	absolutePath: string;
	relativePath: string;
	sourceDescription: string;
}

export interface PulledLexicon {
	nsid: string;
	doc: LexiconDoc;
	location: SourceLocation;
}

export interface PullResult {
	pulled: Map<string, PulledLexicon>;
	rev?: string;
}
