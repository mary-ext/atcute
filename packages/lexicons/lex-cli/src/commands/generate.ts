import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { lexiconDoc, refineLexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';

import { merge, object } from '@optique/core/constructs';
import { message } from '@optique/core/message';
import { type InferValue } from '@optique/core/parser';
import { command, constant } from '@optique/core/primitives';
import pc from 'picocolors';

import { generateLexiconApi, type ImportMapping } from '../codegen.js';
import { loadConfig } from '../config.js';
import { packageJsonSchema } from '../lexicon-metadata.js';
import { sharedOptions } from '../shared-options.js';

/**
 * resolves package imports to ImportMapping[]
 */
const resolveImportsToMappings = async (
	imports: string[],
	configDirname: string,
): Promise<ImportMapping[]> => {
	const mappings: ImportMapping[] = [];

	for (const packageName of imports) {
		// walk up from config directory to find package in node_modules
		let packageJson: unknown;
		let currentDir = configDirname;
		let found = false;

		while (currentDir !== path.dirname(currentDir)) {
			const candidatePath = path.join(currentDir, 'node_modules', packageName, 'package.json');
			try {
				const content = await fs.readFile(candidatePath, 'utf8');
				packageJson = JSON.parse(content);
				found = true;
				break;
			} catch (err: any) {
				// only continue to parent if file not found
				if (err.code !== 'ENOENT') {
					console.error(pc.bold(pc.red(`failed to read package.json for "${packageName}":`)));
					console.error(err);
					process.exit(1);
				}

				// not found, try parent directory
				currentDir = path.dirname(currentDir);
			}
		}

		if (!found) {
			console.error(pc.bold(pc.red(`failed to resolve package "${packageName}"`)));
			console.error(`Could not find package in node_modules starting from ${configDirname}`);
			process.exit(1);
		}

		// validate package.json
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

/**
 * runs the generate command to create type definitions from lexicon documents
 * @param args parsed command arguments
 */
export const runGenerate = async (args: GenerateCommand): Promise<void> => {
	const config = await loadConfig(args.config);

	// resolve imports to mappings
	const importMappings = config.imports ? await resolveImportsToMappings(config.imports, config.root) : [];
	const allMappings = [...importMappings, ...(config.mappings ?? [])];

	const documents: LexiconDoc[] = [];

	for await (const filename of fs.glob(config.files, { cwd: config.root })) {
		let source: string;
		try {
			source = await fs.readFile(path.join(config.root, filename), 'utf8');
		} catch (err) {
			console.error(pc.bold(pc.red(`file read error with "${filename}"`)));
			console.error(err);

			process.exit(1);
		}

		let json: unknown;
		try {
			json = JSON.parse(source);
		} catch (err) {
			console.error(pc.bold(pc.red(`json parse error in "${filename}"`)));
			console.error(err);

			process.exit(1);
		}

		const result = lexiconDoc.try(json, { mode: 'strip' });
		if (!result.ok) {
			console.error(pc.bold(pc.red(`schema validation failed for "${filename}"`)));
			console.error(result.message);

			for (const issue of result.issues) {
				console.log(`- ${issue.code} at .${issue.path.join('.')}`);
			}

			process.exit(1);
		}

		const issues = refineLexiconDoc(result.value, true);
		if (issues.length > 0) {
			console.error(pc.bold(pc.red(`lint validation failed for "${filename}"`)));

			for (const issue of issues) {
				console.log(`- ${issue.message} at .${issue.path.join('.')}`);
			}

			process.exit(1);
		}

		documents.push(result.value);
	}

	const generationResult = await generateLexiconApi({
		documents: documents,
		mappings: allMappings,
		modules: {
			importSuffix: config.modules?.importSuffix ?? '.js',
		},
		prettier: {
			cwd: process.cwd(),
		},
	});

	const outdir = path.join(config.root, config.outdir);

	for (const file of generationResult.files) {
		const filename = path.join(outdir, file.filename);
		const dirname = path.dirname(filename);

		await fs.mkdir(dirname, { recursive: true });
		await fs.writeFile(filename, file.code);
	}
};
