import { lexiconConfigSchema, type LexiconConfig } from './config.ts';

export type { LexiconConfig };

export const defineLexiconConfig = (config: LexiconConfig): LexiconConfig => {
	return lexiconConfigSchema.parse(config);
};
