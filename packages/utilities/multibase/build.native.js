import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { findWorkspaceDir } from '@pnpm/workspace.root-finder';
import { build } from 'zig-build';

const nodeVersion = process.version.slice(1);
const zigBuildDir = join(process.env.HOME || process.env.USERPROFILE, '.zig-build');
const workspaceDir = await findWorkspaceDir(import.meta.dirname);

// zig-build only downloads headers, but Windows linking requires node.lib
const nodeLibDir = join(zigBuildDir, 'node', `v${nodeVersion}`, 'lib');
if (!existsSync(join(nodeLibDir, 'node.lib'))) {
	mkdirSync(nodeLibDir, { recursive: true });

	const url = `https://nodejs.org/download/release/v${nodeVersion}/win-x64/node.lib`;
	execSync(`curl -sL "${url}" -o "${join(nodeLibDir, 'node.lib')}"`);
}

const shared = {
	include: [join(workspaceDir, 'native-shared')],
	sources: ['src/base58.c'],
	napiVersion: 1,
	cflags: ['-Wall', '-Wextra'],
	mode: 'fast',
};

// ensure output directories exist
for (const dir of [
	'linux-x64-glibc',
	'linux-x64-musl',
	'linux-arm64-glibc',
	'linux-arm64-musl',
	'darwin-arm64',
	'win32-x64',
]) {
	mkdirSync(join('prebuilds', dir), { recursive: true });
}

await build({
	'linux-x64-glibc': {
		...shared,
		target: 'x86_64-linux-gnu',
		output: 'prebuilds/linux-x64-glibc/base58.node',
		glibc: '2.17',
	},
	'linux-x64-musl': {
		...shared,
		target: 'x86_64-linux-musl',
		output: 'prebuilds/linux-x64-musl/base58.node',
	},
	'linux-arm64-glibc': {
		...shared,
		target: 'aarch64-linux-gnu',
		output: 'prebuilds/linux-arm64-glibc/base58.node',
		glibc: '2.17',
	},
	'linux-arm64-musl': {
		...shared,
		target: 'aarch64-linux-musl',
		output: 'prebuilds/linux-arm64-musl/base58.node',
	},
	'darwin-arm64': {
		...shared,
		target: 'aarch64-macos',
		output: 'prebuilds/darwin-arm64/base58.node',
		cflags: [...shared.cflags, '-Wl,-undefined,dynamic_lookup'],
	},
	'win32-x64': {
		...shared,
		target: 'x86_64-windows',
		output: 'prebuilds/win32-x64/base58.node',
		libraries: ['node'],
		librariesSearch: [nodeLibDir],
		mode: 'small',
	},
});
