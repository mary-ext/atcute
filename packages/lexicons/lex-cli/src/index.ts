import { lexiconConfigSchema, type LexiconConfig } from './config.js';

export type { LexiconConfig };

export const defineLexiconConfig = (config: LexiconConfig): LexiconConfig => {
	return lexiconConfigSchema.parse(config);
};
