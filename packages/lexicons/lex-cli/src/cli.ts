import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { object } from '@optique/core/constructs';
import { command, constant, option } from '@optique/core/primitives';
import { run } from '@optique/run';
import { path as pathParser } from '@optique/run/valueparser';
import pc from 'picocolors';

import { lexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';

import { generateLexiconApi, type ImportMapping } from './codegen.js';
import type { LexiconConfig } from './index.js';
import { validatePackageJson } from './lexicon-metadata.js';

/**
 * Resolves package imports to ImportMapping[]
 */
const resolveImportsToMappings = async (
	imports: string[],
	configDirname: string,
): Promise<ImportMapping[]> => {
	const mappings: ImportMapping[] = [];

	for (const packageName of imports) {
		// Walk up from config directory to find package in node_modules
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
				// Only continue to parent if file not found
				if (err.code !== 'ENOENT') {
					console.error(pc.bold(pc.red(`failed to read package.json for "${packageName}":`)));
					console.error(err);
					process.exit(1);
				}

				// Not found, try parent directory
				currentDir = path.dirname(currentDir);
			}
		}

		if (!found) {
			console.error(pc.bold(pc.red(`failed to resolve package "${packageName}"`)));
			console.error(`Could not find package in node_modules starting from ${configDirname}`);
			process.exit(1);
		}

		// Validate package.json
		const result = validatePackageJson(packageJson);
		if (!result.success) {
			console.error(pc.bold(pc.red(`invalid atcute:lexicons in "${packageName}":`)));
			console.error(result.issues);
			process.exit(1);
		}

		const lexicons = result.output['atcute:lexicons'];
		if (!lexicons?.mapping) {
			continue;
		}

		// Convert mapping to ImportMapping[]
		for (const [pattern, entry] of Object.entries(lexicons.mapping)) {
			const isWildcard = pattern.endsWith('.*');

			mappings.push({
				nsid: [pattern],
				imports: (nsid: string) => {
					// Check if pattern matches
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

					if (expandedPath.startsWith('./')) {
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

const parser = command(
	'generate',
	object({
		type: constant('generate'),
		config: option('-c', '--config', pathParser({ metavar: 'CONFIG' })),
	}),
);

const result = run(parser, { programName: 'lex-cli' });

if (result.type === 'generate') {
	const configFilename = path.resolve(result.config);
	const configDirname = path.dirname(configFilename);

	let config: LexiconConfig;
	try {
		const configURL = url.pathToFileURL(configFilename);
		const configMod = (await import(configURL.href)) as { default: LexiconConfig };
		config = configMod.default;
	} catch (err) {
		console.error(pc.bold(pc.red(`failed to import config:`)));
		console.error(err);

		process.exit(1);
	}

	// Resolve imports to mappings
	const importMappings = config.imports ? await resolveImportsToMappings(config.imports, configDirname) : [];
	const allMappings = [...importMappings, ...(config.mappings ?? [])];

	const documents: LexiconDoc[] = [];

	for await (const filename of fs.glob(config.files, { cwd: configDirname })) {
		let source: string;
		try {
			source = await fs.readFile(path.join(configDirname, filename), 'utf8');
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

	const outdir = path.join(configDirname, config.outdir);

	for (const file of generationResult.files) {
		const filename = path.join(outdir, file.filename);
		const dirname = path.dirname(filename);

		await fs.mkdir(dirname, { recursive: true });
		await fs.writeFile(filename, file.code);
	}
}
