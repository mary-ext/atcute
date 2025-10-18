import type { ImportMapping } from './codegen.js';

export interface LexiconConfig {
	outdir: string;
	files: string[];
	imports?: string[];
	mappings?: ImportMapping[];
	modules?: {
		importSuffix?: string;
	};
}

export const defineLexiconConfig = (config: LexiconConfig): LexiconConfig => {
	return config;
};
