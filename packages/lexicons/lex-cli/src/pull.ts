import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import { lexiconDoc, refineLexiconDoc, type LexiconDoc } from '@atcute/lexicon-doc';
import prettier from 'prettier';
import pc from 'picocolors';

import { runGit, GitError } from './git.js';
import type { NormalizedConfig, PullConfig, SourceConfig } from './config.js';

interface SourceRevision {
	source: SourceConfig;
	rev: string;
}

interface SourceLocation {
	absolutePath: string;
	relativePath: string;
	sourceDescription: string;
}

interface PulledLexicon {
	nsid: string;
	doc: LexiconDoc;
	location: SourceLocation;
}

interface PullResult {
	pulled: Map<string, PulledLexicon>;
	rev: string;
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

	const result = lexiconDoc.try(json, { mode: 'passthrough' });
	if (!result.ok) {
		console.error(
			pc.bold(
				pc.red(`schema validation failed for ${loc.relativePath} when pulling ${loc.sourceDescription}`),
			),
		);
		console.error(`found in ${loc.absolutePath}`);
		console.error(result.message);

		for (const issue of result.issues) {
			console.log(`- ${issue.code} at .${issue.path.join('.')}`);
		}

		process.exit(1);
	}

	const issues = refineLexiconDoc(result.value, true);
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

	return result.value;
};

const writeLexicon = async (
	outdir: string,
	nsid: string,
	doc: LexiconDoc,
	prettierConfig: prettier.Options | null,
): Promise<void> => {
	const nsidPath = nsid.replaceAll('.', '/');
	const target = path.join(outdir, `${nsidPath}.json`);
	const dirname = path.dirname(target);

	const code = await prettier.format(JSON.stringify(doc, null, 2), {
		...(prettierConfig ?? {}),
		parser: 'json',
	});

	await fs.mkdir(dirname, { recursive: true });
	await fs.writeFile(target, code);
};

/**
 * pulls lexicon documents from a git repository source
 * @param source git source configuration
 * @returns pulled lexicons and commit hash
 */
const pullGitSource = async (source: SourceConfig & { type: 'git' }): Promise<PullResult> => {
	const tempParent = await fs.mkdtemp(path.join(os.tmpdir(), 'lex-cli-pull-'));

	const cloneDir = path.join(tempParent, 'repo');

	try {
		await runGit(
			[
				'clone',
				'--filter=blob:none',
				'--depth',
				'1',
				'--sparse',
				...(source.ref ? ['--branch', source.ref, '--single-branch'] : []),
				source.remote,
				cloneDir,
			],
			{ timeoutMs: 60_000 },
		);
	} catch (err) {
		if (err instanceof GitError) {
			console.error(pc.bold(pc.red(`git clone failed for ${source.remote}:`)));
			console.error(err.stderr || err.message);
			process.exit(1);
		}

		throw err;
	}

	try {
		await runGit(['-C', cloneDir, 'sparse-checkout', 'set', '--no-cone', ...source.pattern], {
			timeoutMs: 30_000,
		});
	} catch (err) {
		if (err instanceof GitError) {
			console.error(pc.bold(pc.red(`git sparse-checkout failed for ${source.remote}:`)));
			console.error(err.stderr || err.message);
			process.exit(1);
		}

		throw err;
	}

	const pulled = new Map<string, PulledLexicon>();

	for await (const filename of fs.glob(source.pattern, { cwd: cloneDir })) {
		const absolute = path.join(cloneDir, filename);
		const stat = await fs.stat(absolute);

		if (!stat.isFile()) {
			continue;
		}

		const location: SourceLocation = {
			absolutePath: absolute,
			relativePath: filename,
			sourceDescription: source.remote,
		};

		const doc = await parseLexiconFile(location);

		pulled.set(doc.id, { nsid: doc.id, doc, location });
	}

	// get the commit hash
	let rev: string;
	try {
		const result = await runGit(['-C', cloneDir, 'rev-parse', 'HEAD'], { timeoutMs: 10_000 });
		rev = result.stdout.trim();
	} catch (err) {
		if (err instanceof GitError) {
			console.error(pc.bold(pc.red(`git rev-parse failed for ${source.remote}:`)));
			console.error(err.stderr || err.message);
			process.exit(1);
		}

		throw err;
	}

	await fs.rm(tempParent, { recursive: true, force: true });

	return { pulled, rev };
};

const pullSource = async (source: SourceConfig): Promise<PullResult> => {
	switch (source.type) {
		case 'git': {
			return pullGitSource(source);
		}
	}
};

const writeSourceReadme = async (
	outdir: string,
	revisions: SourceRevision[],
	prettierConfig: prettier.Options | null,
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
				lines.push(`  - commit: ${rev}`);
				break;
			}
		}
	}

	lines.push('');

	const content = lines.join('\n');
	const formatted = await prettier.format(content, {
		...(prettierConfig ?? {}),
		parser: 'markdown',
	});

	await fs.writeFile(path.join(outdir, 'README.md'), formatted);
};

/**
 * pulls lexicon documents from configured sources and writes them to disk using nsid-based paths.
 * @param config normalized lex-cli configuration
 */
export const runPull = async (config: NormalizedConfig): Promise<void> => {
	const pullConfig = ensurePullConfig(config);
	const outdir = path.resolve(config.root, pullConfig.outdir);
	const prettierConfig = await prettier.resolveConfig(config.root, { editorconfig: true });

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

	for (const entry of collected) {
		await writeLexicon(outdir, entry.nsid, entry.doc, prettierConfig);
	}

	await writeSourceReadme(outdir, sourceRevisions, prettierConfig);
};
