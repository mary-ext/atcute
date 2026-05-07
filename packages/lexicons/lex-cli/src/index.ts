import * as v from 'valibot';

import { lexiconConfigSchema, type LexiconConfig } from './config.ts';

export type { LexiconConfig };

export const defineLexiconConfig = (config: LexiconConfig): LexiconConfig => {
	return v.parse(lexiconConfigSchema, config);
};
