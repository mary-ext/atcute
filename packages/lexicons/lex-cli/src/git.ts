import { spawn } from 'node:child_process';

export interface GitCommandOptions {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	stdin?: string;
	timeoutMs?: number;
}

export interface GitResult {
	stdout: string;
	stderr: string;
}

export class GitError extends Error {
	readonly args: readonly string[];
	readonly code: number | null;
	readonly signal: NodeJS.Signals | null;
	readonly stdout: string;
	readonly stderr: string;

	constructor(
		args: readonly string[],
		stdout: string,
		stderr: string,
		code: number | null,
		signal: NodeJS.Signals | null,
	) {
		const reason = code !== null ? `code ${code}` : `signal ${signal ?? 'unknown'}`;
		super(`git ${args.join(' ')} failed with ${reason}`);

		this.name = 'GitError';
		this.args = args;
		this.code = code;
		this.signal = signal;
		this.stdout = stdout;
		this.stderr = stderr;
	}
}

/**
 * runs git with the provided arguments and throws when the command fails.
 *
 * @param args positional arguments for git
 * @param options execution options
 * @returns stdout and stderr from git
 * @throws GitError when git exits with a non-zero status or is terminated
 */
export const runGit = (args: readonly string[], options: GitCommandOptions = {}): Promise<GitResult> => {
	return new Promise((resolve, reject) => {
		const child = spawn('git', args, {
			cwd: options.cwd,
			env: options.env,
			stdio: ['pipe', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.setEncoding('utf8');
		child.stderr?.setEncoding('utf8');

		child.stdout?.on('data', (chunk) => {
			stdout += chunk;
		});

		child.stderr?.on('data', (chunk) => {
			stderr += chunk;
		});

		let timer: NodeJS.Timeout | undefined;
		if (options.timeoutMs !== undefined) {
			timer = setTimeout(() => {
				child.kill('SIGKILL');
			}, options.timeoutMs);
		}

		child.on('error', (err) => {
			if (timer) {
				clearTimeout(timer);
			}

			reject(err);
		});

		child.on('close', (code, signal) => {
			if (timer) {
				clearTimeout(timer);
			}

			if (code === 0) {
				resolve({ stdout, stderr });
				return;
			}

			reject(new GitError(args, stdout, stderr, code, signal));
		});

		if (options.stdin !== undefined) {
			child.stdin?.end(options.stdin);
		} else {
			child.stdin?.end();
		}
	});
};
