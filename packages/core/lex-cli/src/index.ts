import { writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

import * as v from '@badrap/valita';
import { Builtins, Command, Option, Program } from '@externdefs/collider';
import pc from 'picocolors';
import prettier from 'prettier';

import { generateDefinitions } from './generator.js';

const program = new Program({ binaryName: 'lex-cli' });

program.register(Builtins.HelpCommand);

program.register(
	class GenerateMainLexicons extends Command {
		static override paths = [['generate-main']];

		static override usage = Command.Usage({
			description: `Generates the main type definition file`,
		});

		output = Option.String(['-o', '--output'], {
			required: false,
			description: 'Where to save the resulting type definition file, defaults to stdout if not passed',
			validator: v
				.string()
				.assert((v) => basename(v).endsWith('.ts'), `expected output file to end with .ts extension`),
		});

		desc = Option.String(['--description'], {
			required: false,
			description: 'Module description',
		});

		banner = Option.String(['--banner'], {
			required: false,
			description: 'Insert an arbitrary string at the beginning of the module',
		});

		files = Option.Rest({
			required: 1,
			name: 'files',
		});

		async execute(): Promise<number | void> {
			let code: string;

			try {
				code = await generateDefinitions({
					files: this.files,
					main: true,
					banner: this.banner,
					description: this.desc,
				});
			} catch (err) {
				if (err instanceof Error) {
					console.error(pc.bold(`${pc.red(`error:`)} ${err.message}`));

					if (err.cause instanceof Error) {
						console.error(`  ${pc.gray(`caused by:`)} ${err.cause.message}`);
					}
				} else {
					console.error(pc.bold(pc.red(`unknown error occured:`)));
					console.error(err);
				}

				return 1;
			}

			const config = await prettier.resolveConfig(this.output || process.cwd(), { editorconfig: true });
			const formatted = await prettier.format(code, { ...config, parser: 'typescript' });

			if (this.output) {
				await writeFile(this.output, formatted);
			} else {
				console.log(formatted);
			}
		}
	},
);

program.register(
	class GenerateLexicons extends Command {
		static override paths = [['generate']];

		static override usage = Command.Usage({
			description: `Generates a type definition file`,
		});

		output = Option.String(['-o', '--output'], {
			required: false,
			description: 'Where to save the resulting type definition file, defaults to stdout if not passed',
			validator: v
				.string()
				.assert((v) => basename(v).endsWith('.ts'), `expected output file to end with .ts extension`),
		});

		desc = Option.String(['--description'], {
			required: false,
			description: 'Module description',
		});

		banner = Option.String(['--banner'], {
			required: false,
			description: 'Insert an arbitrary string at the beginning of the module',
		});

		files = Option.Rest({
			required: 1,
			name: 'files',
		});

		async execute(): Promise<number | void> {
			let code: string;

			try {
				code = await generateDefinitions({
					files: this.files,
					main: false,
					banner: this.banner,
					description: this.desc,
				});
			} catch (err) {
				if (err instanceof Error) {
					console.error(pc.bold(`${pc.red(`error: `)}: ${err.message}`));

					if (err.cause instanceof Error) {
						console.error(`  ${pc.gray(`caused by:`)}: ${err.cause.message}`);
					}
				} else {
					console.error(pc.bold(pc.red(`unknown error occured:`)));
					console.error(err);
				}

				return 1;
			}

			const config = await prettier.resolveConfig(this.output || process.cwd(), { editorconfig: true });
			const formatted = await prettier.format(code, { ...config, parser: 'typescript' });

			if (this.output) {
				await writeFile(this.output, formatted);
			} else {
				console.log(formatted);
			}
		}
	},
);

const exitCode = await program.run(process.argv.slice(2));
process.exitCode = exitCode;
