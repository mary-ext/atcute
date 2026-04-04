import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';

import type { FormatterConfig } from './config.ts';

/** formats source code */
export interface Formatter {
	/**
	 * formats the given code
	 * @param code source code to format
	 * @param filepath filepath hint for language detection and config resolution
	 * @returns formatted code
	 */
	format(code: string, filepath: string): Promise<string>;
}

const inferPrettierParser = (filepath: string): string => {
	if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
		return 'typescript';
	}
	if (filepath.endsWith('.json')) {
		return 'json';
	}
	if (filepath.endsWith('.md') || filepath.endsWith('.markdown')) {
		return 'markdown';
	}
	return 'typescript';
};

// #region semaphore

interface Lock {
	release(): void;
}

class Semaphore {
	private waiting: (() => void)[] = [];
	private active = 0;
	private max: number;

	constructor(max: number) {
		this.max = max;
	}

	acquire(): Promise<Lock> {
		const lock: Lock = {
			release: () => {
				this.active--;
				const next = this.waiting.shift();
				if (next) {
					this.active++;
					next();
				}
			},
		};

		if (this.active < this.max) {
			this.active++;
			return Promise.resolve(lock);
		}

		const { promise, resolve } = Promise.withResolvers<Lock>();
		this.waiting.push(() => resolve(lock));
		return promise;
	}
}

// #endregion

/**
 * creates a formatter from the given configuration
 * @param config formatter configuration
 * @param root project root for config resolution
 * @returns a formatter instance
 */
export const createFormatter = async (config: FormatterConfig, root: string): Promise<Formatter> => {
	let inner: Formatter;
	let concurrency: number;

	if (config.type === 'prettier') {
		const prettier = await import('prettier');
		const prettierConfig = await prettier.resolveConfig(root, { editorconfig: true });

		// prettier is in-process and CPU-bound, so concurrency only helps
		// avoid buffering all files in memory at once
		concurrency = availableParallelism();
		inner = {
			async format(code, filepath) {
				return prettier.format(code, { ...prettierConfig, parser: inferPrettierParser(filepath) });
			},
		};
	} else {
		// the template uses {filepath} as a placeholder, which is passed as a
		// positional argument to sh to avoid shell injection via filenames
		const shellCmd = config.command.replaceAll('{filepath}', '"$1"');

		concurrency = config.concurrency;
		inner = {
			format(code, filepath) {
				return new Promise<string>((resolve, reject) => {
					const child = spawn('sh', ['-c', shellCmd, 'sh', filepath], {
						stdio: ['pipe', 'pipe', 'pipe'],
					});

					const stdoutChunks: Buffer[] = [];
					const stderrChunks: Buffer[] = [];

					child.stdout.on('data', (chunk: Buffer) => {
						stdoutChunks.push(chunk);
					});

					child.stderr.on('data', (chunk: Buffer) => {
						stderrChunks.push(chunk);
					});

					child.on('error', reject);

					child.on('close', (exitCode: number | null) => {
						if (exitCode !== 0) {
							const stderr = Buffer.concat(stderrChunks).toString();
							reject(new Error(`formatter exited with code ${exitCode}:\n${stderr}`));
						} else {
							resolve(Buffer.concat(stdoutChunks).toString());
						}
					});

					child.stdin.end(code);
				});
			},
		};
	}

	const semaphore = new Semaphore(concurrency);

	return {
		async format(code, filepath) {
			const lock = await semaphore.acquire();
			try {
				return await inner.format(code, filepath);
			} finally {
				lock.release();
			}
		},
	};
};
