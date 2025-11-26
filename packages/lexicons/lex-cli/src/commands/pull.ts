import { merge, object } from '@optique/core/constructs';
import { message } from '@optique/core/message';
import { type InferValue } from '@optique/core/parser';
import { command, constant } from '@optique/core/primitives';

import { loadConfig } from '../config.js';
import { runPull as runPullImpl } from '../pull.js';
import { sharedOptions } from '../shared-options.js';

export const pullCommandSchema = command(
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

export type PullCommand = InferValue<typeof pullCommandSchema>;

/**
 * runs the pull command to fetch lexicon documents from configured sources
 * @param args parsed command arguments
 */
export const runPull = async (args: PullCommand): Promise<void> => {
	const config = await loadConfig(args.config);
	await runPullImpl(config);
};
