import { merge, object, or } from '@optique/core/constructs';
import { message } from '@optique/core/message';
import { optional } from '@optique/core/modifiers';
import { type InferValue } from '@optique/core/parser';
import { command, constant, option } from '@optique/core/primitives';
import { run } from '@optique/run';
import { path as pathParser } from '@optique/run/valueparser';

const sharedOptions = object(`Global options`, {
	config: optional(
		option('-c', '--config', pathParser({ metavar: 'CONFIG' }), {
			description: message`path to the lexicon configuration file. defaults to searching for lex.config.js or lex.config.ts in the current directory.`,
		}),
	),
});

const generateCommandSchema = command(
	'generate',
	merge(
		object({
			type: constant('generate'),
		}),
		sharedOptions,
	),
	{
		brief: message`generate type definitions from lexicon documents`,
		description: message`reads lexicon documents from the configured files and generates TypeScript type definitions and runtime validators.`,
	},
);

const pullCommandSchema = command(
	'pull',
	merge(
		object({
			type: constant('pull'),
		}),
		sharedOptions,
	),
	{
		brief: message`pull lexicon documents from configured sources`,
		description: message`fetches lexicon documents from configured git repositories and writes them to the output directory.`,
	},
);

const exportCommandSchema = command(
	'export',
	merge(
		object({
			type: constant('export'),
		}),
		sharedOptions,
	),
	{
		brief: message`export lexicon documents as JSON files`,
		description: message`exports lexicon documents (from JSON or builder files) to JSON format for publishing or distribution.`,
	},
);

export type GenerateCommand = InferValue<typeof generateCommandSchema>;
export type PullCommand = InferValue<typeof pullCommandSchema>;
export type ExportCommand = InferValue<typeof exportCommandSchema>;

const parser = or(generateCommandSchema, pullCommandSchema, exportCommandSchema);

const result = run(parser, { programName: 'lex-cli', help: 'both' });

if (result.type === 'generate') {
	const { handler } = await import('./commands/generate.ts');
	await handler(result);
} else if (result.type === 'pull') {
	const { handler } = await import('./commands/pull.ts');
	await handler(result);
} else if (result.type === 'export') {
	const { handler } = await import('./commands/export.ts');
	await handler(result);
}
