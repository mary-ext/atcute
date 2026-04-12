import * as fs from 'node:fs/promises';
import * as module from 'node:module';
import * as path from 'node:path';

import { merge, object } from '@optique/core/constructs';
import { message } from '@optique/core/message';
import { type InferValue } from '@optique/core/parser';
import { command, constant } from '@optique/core/primitives';
import pc from 'picocolors';

import { generateLexiconApi, type ImportMapping } from '../codegen.ts';
import { loadConfig, type GenerateConfig, type NormalizedConfig } from '../config.ts';
import { createFormatter } from '../formatter.ts';
import { loadLexicons } from '../lexicon-loader.ts';
import { packageJsonSchema } from '../lexicon-metadata.ts';
import { sharedOptions } from '../shared-options.ts';

/**
 * resolves package imports to ImportMapping[]
 */
const resolveImportsToMappings = async (
	imports: string[],
	configDirname: string,
): Promise<ImportMapping[]> => {
	const mappings: ImportMapping[] = [];
	const require = module.createRequire(path.join(configDirname, '__lex_cli__.js'));

	for (const packageName of imports) {
		let packageJson: unknown;

		try {
			const entryPath = require.resolve(packageName);

			let currentDir = path.dirname(entryPath);
			while (true) {
				const candidatePath = path.join(currentDir, 'package.json');
				try {
					const content = await fs.readFile(candidatePath, 'utf8');
					packageJson = JSON.parse(content);
					break;
				} catch (err: any) {
					if (err.code !== 'ENOENT') {
						console.error(pc.bold(pc.red(`failed to read package.json for "${packageName}":`)));
						console.error(err);
						process.exit(1);
					}
				}

				if (currentDir === configDirname) {
					break;
				}

				const parentDir = path.dirname(currentDir);
				if (parentDir === currentDir) {
					break;
				}

				currentDir = parentDir;
			}
		} catch (err) {
			console.error(pc.bold(pc.red(`failed to resolve package "${packageName}"`)));
			console.error(err);
			process.exit(1);
		}

		if (!packageJson) {
			console.error(pc.bold(pc.red(`failed to locate package.json for "${packageName}"`)));
			process.exit(1);
		}

		const result = packageJsonSchema.try(packageJson, { mode: 'passthrough' });
		if (!result.ok) {
			console.error(pc.bold(pc.red(`invalid atcute:lexicons in "${packageName}":`)));
			console.error(result.message);

			for (const issue of result.issues) {
				console.log(`- ${issue.code} at .${issue.path.join('.')}`);
			}

			process.exit(1);
		}

		const lexicons = result.value['atcute:lexicons'];
		if (!lexicons?.mappings) {
			continue;
		}

		// convert mapping to ImportMapping[]
		for (const [pattern, entry] of Object.entries(lexicons.mappings)) {
			const isWildcard = pattern.endsWith('.*');

			mappings.push({
				nsid: [pattern],
				imports: (nsid: string) => {
					// check if pattern matches
					if (isWildcard) {
						if (!nsid.startsWith(pattern.slice(0, -1))) {
							throw new Error(`NSID ${nsid} does not match pattern ${pattern}`);
						}
					} else {
						if (nsid !== pattern) {
							throw new Error(`NSID ${nsid} does not match pattern ${pattern}`);
						}
					}

					const nsidPrefix = isWildcard ? pattern.slice(0, -2) : pattern;
					const nsidRemainder = isWildcard ? nsid.slice(nsidPrefix.length + 1) : '';

					let expandedPath = entry.path
						.replaceAll('{{nsid}}', nsid.replaceAll('.', '/'))
						.replaceAll('{{nsid_remainder}}', nsidRemainder.replaceAll('.', '/'))
						.replaceAll('{{nsid_prefix}}', nsidPrefix.replaceAll('.', '/'));

					if (expandedPath === '.') {
						expandedPath = packageName;
					} else if (expandedPath.startsWith('./')) {
						expandedPath = `${packageName}/${expandedPath.slice(2)}`;
					}

					return {
						type: entry.type,
						from: expandedPath,
					};
				},
			});
		}
	}

	return mappings;
};

export const generateCommandSchema = command(
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

export type GenerateCommand = InferValue<typeof generateCommandSchema>;

const ensureGenerateConfig = (config: NormalizedConfig): GenerateConfig => {
	return config.generate ?? {};
};

/**
 * runs the generate command to create type definitions from lexicon documents
 * @param args parsed command arguments
 */
export const runGenerate = async (args: GenerateCommand): Promise<void> => {
	const config = await loadConfig(args.config);
	const generateConfig = ensureGenerateConfig(config);

	// resolve imports to mappings
	const importMappings = config.imports ? await resolveImportsToMappings(config.imports, config.root) : [];
	const allMappings = [...importMappings, ...(config.mappings ?? [])];

	// load lexicons from files
	const loaded = await loadLexicons(config.files, config.root);
	const documents = loaded.map((l) => l.doc);

	const outdir = path.join(config.root, config.outdir);
	const formatter = await createFormatter(config.formatter, config.root);

	if (generateConfig.clean) {
		await fs.rm(outdir, { recursive: true, force: true });
	}

	try {
		const pending: Promise<void>[] = [];

		for (const file of generateLexiconApi({
			documents: documents,
			mappings: allMappings,
			modules: {
				importSuffix: config.modules?.importSuffix ?? '.js',
			},
		})) {
			const filename = path.join(outdir, file.filename);

			pending.push(
				(async () => {
					const formatted = await formatter.format(file.code, filename);
					await fs.mkdir(path.dirname(filename), { recursive: true });
					await fs.writeFile(filename, formatted);
				})(),
			);
		}

		await Promise.all(pending);
	} finally {
		await formatter.dispose();
	}
};
