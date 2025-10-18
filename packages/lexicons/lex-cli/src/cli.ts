import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { object } from '@optique/core/constructs';
import { command, constant, option } from '@optique/core/primitives';
import { run } from '@optique/run';
import { path as pathParser } from '@optique/run/valueparser';
import pc from 'picocolors';

import { lexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';

import { generateLexiconApi } from './codegen.js';
import type { LexiconConfig } from './index.js';

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
		mappings: config.mappings ?? [],
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
