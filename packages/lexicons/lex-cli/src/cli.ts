import { or } from '@optique/core/constructs';
import { run } from '@optique/run';

import { exportCommandSchema, runExport } from './commands/export.ts';
import { generateCommandSchema, runGenerate } from './commands/generate.ts';
import { pullCommandSchema, runPull } from './commands/pull.ts';

const parser = or(generateCommandSchema, pullCommandSchema, exportCommandSchema);

const result = run(parser, { programName: 'lex-cli', help: 'both' });

if (result.type === 'generate') {
	await runGenerate(result);
} else if (result.type === 'pull') {
	await runPull(result);
} else if (result.type === 'export') {
	await runExport(result);
}
