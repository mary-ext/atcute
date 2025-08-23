import type { ImportMapping } from './codegen.js';

export interface LexiconConfig {
	outdir: string;
	files: string[];
	mappings?: ImportMapping[];
	tsImports?: boolean;
}

export const defineLexiconConfig = (config: LexiconConfig): LexiconConfig => {
	return config;
};
