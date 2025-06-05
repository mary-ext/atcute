import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { Builtins, Command, Option, Program } from '@externdefs/collider';
import pc from 'picocolors';

import { lexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';

import { generateLexiconApi } from './codegen.js';
import type { LexiconConfig } from './index.js';

const program = new Program({ binaryName: 'lex-cli' });

program.register(Builtins.HelpCommand);

program.register(
	class GenerateCommand extends Command {
		static override paths = [['generate']];

		static override usage = Command.Usage({
			description: `Generates TypeScript schema`,
		});

		config = Option.String(['-c', '--config'], {
			required: true,
			description: `Config file`,
		});

		async execute(): Promise<number | void> {
			const configFilename = path.resolve(this.config);
			const configDirname = path.dirname(configFilename);

			let config: LexiconConfig;
			try {
				const configURL = url.pathToFileURL(configFilename);
				const configMod = (await import(configURL.href)) as { default: LexiconConfig };
				config = configMod.default;
			} catch (err) {
				console.error(pc.bold(pc.red(`failed to import config:`)));
				console.error(err);

				return 1;
			}

			const documents: LexiconDoc[] = [];

			for await (const filename of fs.glob(config.files, { cwd: configDirname })) {
				let source: string;
				try {
					source = await fs.readFile(path.join(configDirname, filename), 'utf8');
				} catch (err) {
					console.error(pc.bold(pc.red(`file read error with "${filename}"`)));
					console.error(err);

					return 1;
				}

				let json: unknown;
				try {
					json = JSON.parse(source);
				} catch (err) {
					console.error(pc.bold(pc.red(`json parse error in "${filename}"`)));
					console.error(err);

					return 1;
				}

				const result = lexiconDoc.try(json, { mode: 'strip' });
				if (!result.ok) {
					console.error(pc.bold(pc.red(`schema validation failed for "${filename}"`)));
					console.error(result.message);

					for (const issue of result.issues) {
						console.log(`- ${issue.code} at .${issue.path.join('.')}`);
					}

					return 1;
				}

				documents.push(result.value);
			}

			const result = await generateLexiconApi({
				documents: documents,
				mappings: config.mappings ?? [],
				prettier: {},
			});

			const outdir = path.join(configDirname, config.outdir);

			for (const file of result.files) {
				const filename = path.join(outdir, file.filename);
				const dirname = path.dirname(filename);

				await fs.mkdir(dirname, { recursive: true });
				await fs.writeFile(filename, file.code);
			}
		}
	},
);

const exitCode = await program.run(process.argv.slice(2));
process.exitCode = exitCode;
