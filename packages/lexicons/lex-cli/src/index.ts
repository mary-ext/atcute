import type { ImportMapping } from './codegen.js';

export interface LexiconConfig {
	outdir: string;
	files: string[];
	mappings?: ImportMapping[];
}

export const defineLexiconConfig = (config: LexiconConfig): LexiconConfig => {
	return config;
};
