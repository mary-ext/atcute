import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import type { LexiconDoc } from '@atcute/lexicon-doc';

import pc from 'picocolors';

import type { GitSourceConfig } from '../config.ts';
import { runGit, GitError } from '../git.ts';

import type { PullResult, PulledLexicon, SourceLocation } from './types.ts';

/**
 * pulls lexicon documents from a git repository source
 * @param source git source configuration
 * @param parseLexiconFile function to parse and validate lexicon files
 * @returns pulled lexicons and commit hash
 */
export const pullGitSource = async (
	source: GitSourceConfig,
	parseLexiconFile: (loc: SourceLocation) => Promise<LexiconDoc>,
): Promise<PullResult> => {
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
