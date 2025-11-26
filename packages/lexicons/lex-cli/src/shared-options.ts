import { object } from '@optique/core/constructs';
import { message } from '@optique/core/message';
import { optional } from '@optique/core/modifiers';
import { option } from '@optique/core/primitives';
import { path as pathParser } from '@optique/run/valueparser';

export const sharedOptions = object(`Global options`, {
	config: optional(
		option('-c', '--config', pathParser({ metavar: 'CONFIG' }), {
			description: message`path to the lexicon configuration file. defaults to searching for lex.config.js or lex.config.ts in the current directory.`,
		}),
	),
});
