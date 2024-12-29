import type { PackageSizeInformation } from './data.js';

import * as fs from 'node:fs';
import { load as parseYaml } from 'js-yaml';
import { WORKSPACE_ROOT } from './consts.js';
import { computeFolderSize } from './fs.js';
import { computeBundleInformation } from './bundle.js';

interface PackageJsonData {
	folder: URL;
	relpath: string;
	name: string;
	private: boolean;
	exports: Record<string, string> | null; // let's pretend the export map doesn't exist for now shall we :)
}

const PNPM_LOCKFILE = new URL('pnpm-lock.yaml', WORKSPACE_ROOT);

export function getAllWorkspacePackages(): PackageJsonData[] {
	const pnpmLockfileYaml = fs.readFileSync(PNPM_LOCKFILE, 'utf8');
	const pnpmLockfile = parseYaml(pnpmLockfileYaml) as any;
	const packages = Object.keys(pnpmLockfile.importers);

	return packages
		.map((p) => {
			const packageFolder = new URL(`${p}/`, WORKSPACE_ROOT);
			const packageJsonFile = new URL('package.json', packageFolder);
			const packageJson = fs.readFileSync(packageJsonFile, 'utf8');
			return Object.assign({}, JSON.parse(packageJson), {
				folder: packageFolder,
				relpath: p,
			}) as PackageJsonData;
		})
		.filter((p) => !p.private);
}

export function computePackageSizeInformation(
	pkg: PackageJsonData,
	keepBuilds = false,
): PackageSizeInformation {
	const dist = new URL('dist/', pkg.folder);
	const { size: installSize } = computeFolderSize(dist);

	const pkgSizeInformation: PackageSizeInformation = {
		name: pkg.name,
		installSize,
		entries: [],
	};

	// Those are just declaration packages with no useful payload.
	if (pkg.relpath.includes('definitions')) return pkgSizeInformation;

	// CLI & what not
	if (!pkg.exports) return pkgSizeInformation;

	for (const entry in pkg.exports) {
		if (!Object.hasOwn(pkg.exports, entry)) continue;

		const entryQualifier = pkg.name + entry.slice(1);
		const entryFile = new URL(pkg.exports[entry], pkg.folder);

		const data = computeBundleInformation(entryFile, entryQualifier, keepBuilds);
		pkgSizeInformation.entries.push({
			name: entryQualifier,
			...data,
		});
	}

	return pkgSizeInformation;
}
