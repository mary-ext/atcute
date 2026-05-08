import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { lexiconDoc, refineLexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';

import pc from 'picocolors';
import * as v from 'valibot';

import type { PullCommand } from '../cli.ts';
import { loadConfig, type NormalizedConfig, type PullConfig, type SourceConfig } from '../config.ts';
import { createFormatter, type Formatter } from '../formatter.ts';
import { pullAtprotoSource } from '../pull-sources/atproto.ts';
import { pullGitSource } from '../pull-sources/git.ts';
import type { PullResult, PulledLexicon, SourceLocation } from '../pull-sources/types.ts';
import { printValibotIssues } from '../utils/issues.ts';

interface SourceRevision {
	source: SourceConfig;
	rev?: string;
}

const ensurePullConfig = (config: NormalizedConfig): PullConfig => {
	if (!config.pull) {
		console.error(pc.bold(pc.red(`pull configuration missing`)));
		process.exit(1);
	}

	return config.pull;
};

const parseLexiconFile = async (loc: SourceLocation): Promise<LexiconDoc> => {
	let source: string;

	try {
		source = await fs.readFile(loc.absolutePath, 'utf8');
	} catch (err) {
		console.error(
			pc.bold(pc.red(`file read error for ${loc.relativePath} when pulling ${loc.sourceDescription}`)),
		);
		console.error(`found in ${loc.absolutePath}`);
		console.error(err);
		process.exit(1);
	}

	let json: unknown;
	try {
		json = JSON.parse(source);
	} catch (err) {
		console.error(
			pc.bold(pc.red(`json parse error in ${loc.relativePath} when pulling ${loc.sourceDescription}`)),
		);
		console.error(`found in ${loc.absolutePath}`);
		console.error(err);
		process.exit(1);
	}

	const result = v.safeParse(lexiconDoc, json);
	if (!result.success) {
		console.error(
			pc.bold(
				pc.red(`schema validation failed for ${loc.relativePath} when pulling ${loc.sourceDescription}`),
			),
		);
		console.error(`found in ${loc.absolutePath}`);
		printValibotIssues(result.issues);
		process.exit(1);
	}

	const issues = refineLexiconDoc(result.output, true);
	if (issues.length > 0) {
		console.error(
			pc.bold(pc.red(`lint validation failed for ${loc.relativePath} when pulling ${loc.sourceDescription}`)),
		);
		console.error(`found in ${loc.absolutePath}`);

		for (const issue of issues) {
			console.log(`- ${issue.message} at .${issue.path.join('.')}`);
		}

		process.exit(1);
	}

	return result.output;
};

// valibot rebuilds objects in schema key order; reorder back into dag-cbor
// canonical order (shorter keys first, then lexicographic) so writes are
// deterministic regardless of schema field declaration order
const canonicalize = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}
	if (value !== null && typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		const keys = Object.keys(obj).toSorted((a, b) => a.length - b.length || (a < b ? -1 : 1));
		const result: Record<string, unknown> = {};
		for (const key of keys) {
			result[key] = canonicalize(obj[key]);
		}

		return result;
	}
	return value;
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

	const code = await formatter.format(JSON.stringify(canonicalize(doc), null, 2), target);

	await fs.mkdir(dirname, { recursive: true });
	await fs.writeFile(target, code);
};

const pullSource = async (source: SourceConfig): Promise<PullResult> => {
	switch (source.type) {
		case 'git': {
			return pullGitSource(source, parseLexiconFile);
		}
		case 'atproto': {
			return pullAtprotoSource(source);
		}
	}
};

const writeSourceReadme = async (
	outdir: string,
	revisions: SourceRevision[],
	formatter: Formatter,
): Promise<void> => {
	const lines = [
		'# lexicon sources',
		'',
		'this directory contains lexicon documents pulled from the following sources:',
		'',
	];

	for (const { source, rev } of revisions) {
		switch (source.type) {
			case 'git': {
				lines.push(`- ${source.remote}${source.ref ? ` (ref: ${source.ref})` : ``}`);
				if (rev) {
					lines.push(`  - commit: ${rev}`);
				}
				break;
			}
			case 'atproto': {
				if (source.mode === 'nsids') {
					lines.push(`- atproto (nsids: ${source.nsids.join(', ')})`);
				} else {
					lines.push(
						`- atproto (authority: ${source.authority}${source.pattern ? `, pattern: ${source.pattern.join(', ')}` : ''})`,
					);
				}
				break;
			}
		}
	}

	lines.push('');

	const content = lines.join('\n');
	const target = path.join(outdir, 'README.md');
	const formatted = await formatter.format(content, target);

	await fs.writeFile(target, formatted);
};

/**
 * runs the pull command to fetch lexicon documents from configured sources
 * @param args parsed command arguments
 */
export const handler = async (args: PullCommand): Promise<void> => {
	const config = await loadConfig(args.config);
	const pullConfig = ensurePullConfig(config);

	const outdir = path.resolve(config.root, pullConfig.outdir);
	const formatter = await createFormatter(config.formatter, config.root);

	try {
		const seen = new Map<string, SourceLocation>();
		const collected: PulledLexicon[] = [];
		const sourceRevisions: SourceRevision[] = [];

		for (const source of pullConfig.sources) {
			const result = await pullSource(source);

			sourceRevisions.push({ source, rev: result.rev });

			for (const [nsid, entry] of result.pulled) {
				const existing = seen.get(nsid);

				if (existing) {
					console.error(pc.bold(pc.red(`duplicate lexicon "${nsid}"`)));
					console.error(`- found ${entry.location.relativePath} from ${entry.location.sourceDescription}`);
					console.error(`  at ${entry.location.absolutePath}`);
					console.error(`- already found ${existing.relativePath} from ${existing.sourceDescription}`);
					console.error(`  at ${existing.absolutePath}`);
					process.exit(1);
				}

				seen.set(nsid, entry.location);
				collected.push(entry);
			}
		}

		if (pullConfig.clean) {
			await fs.rm(outdir, { recursive: true, force: true });
		}

		await fs.mkdir(outdir, { recursive: true });

		await Promise.all([
			...collected.map((entry) => writeLexicon(outdir, entry.nsid, entry.doc, formatter)),
			writeSourceReadme(outdir, sourceRevisions, formatter),
		]);
	} finally {
		await formatter.dispose();
	}
};
