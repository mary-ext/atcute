import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { LexiconDoc } from '@atcute/lexicon-doc';

import { merge, object } from '@optique/core/constructs';
import { message } from '@optique/core/message';
import { type InferValue } from '@optique/core/parser';
import { command, constant } from '@optique/core/primitives';
import pc from 'picocolors';

import { loadConfig, type ExportConfig, type NormalizedConfig } from '../config.ts';
import { createFormatter, type Formatter } from '../formatter.ts';
import { loadLexicons } from '../lexicon-loader.ts';
import { sharedOptions } from '../shared-options.ts';

export const exportCommandSchema = command(
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

export type ExportCommand = InferValue<typeof exportCommandSchema>;

/**
 * ensures export configuration is present
 * @param config the normalized config
 * @returns the export config
 */
const ensureExportConfig = (config: NormalizedConfig): ExportConfig => {
	if (!config.export) {
		console.error(pc.bold(pc.red(`export configuration missing`)));
		process.exit(1);
	}

	return config.export;
};

const writeLexicon = async (
	outdir: string,
	nsid: string,
	doc: LexiconDoc,
	formatter: Formatter,
): Promise<void> => {
	const nsidPath = nsid.replaceAll('.', '/');
	const target = path.join(outdir, `${nsidPath}.json`);
	const dirname = path.dirname(target);

	const code = await formatter.format(JSON.stringify(doc, null, 2), target);

	await fs.mkdir(dirname, { recursive: true });
	await fs.writeFile(target, code);
};

/**
 * runs the export command to write lexicon documents as JSON files
 * @param args parsed command arguments
 */
export const runExport = async (args: ExportCommand): Promise<void> => {
	const config = await loadConfig(args.config);
	const exportConfig = ensureExportConfig(config);

	// use export.files if specified, otherwise fall back to generate.files
	const files = exportConfig.files ?? config.generate?.files;
	if (!files || files.length === 0) {
		console.error(pc.bold(pc.red(`export.files or generate.files must be specified`)));
		process.exit(1);
	}

	const outdir = path.resolve(config.root, exportConfig.outdir);
	const formatter = await createFormatter(config.formatter, config.root);

	try {
		// load lexicons from files
		const loaded = await loadLexicons(files, config.root);

		if (loaded.length === 0) {
			console.warn(pc.yellow(`warning: no lexicons found to export`));
			return;
		}

		// clean output directory if requested
		if (exportConfig.clean) {
			await fs.rm(outdir, { recursive: true, force: true });
		}

		await fs.mkdir(outdir, { recursive: true });

		// write each lexicon as JSON
		await Promise.all(loaded.map(({ nsid, doc }) => writeLexicon(outdir, nsid, doc, formatter)));

		console.log(pc.green(`exported ${loaded.length} lexicon(s) to ${outdir}`));
	} finally {
		await formatter.dispose();
	}
};
