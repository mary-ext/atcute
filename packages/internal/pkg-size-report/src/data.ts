import type { Metafile } from 'esbuild';

import * as fs from 'node:fs';
import { PKGSIZE_FOLDER } from './consts.js';

const PKGSIZE_DATA = new URL(`data.json`, PKGSIZE_FOLDER);

export interface EntrypointSizeInformation {
	name: string;
	size: number;
	gzip: number;
	brotli: number;
	metafile: Metafile;
}

export interface PackageSizeInformation {
	name: string;
	installSize: number;
	entries: EntrypointSizeInformation[];
}

export function saveSizeData(data: PackageSizeInformation[]): void {
	const json = JSON.stringify(data, (k, v) => (k === 'metafile' ? void 0 : v), '\t');
	fs.writeFileSync(PKGSIZE_DATA, json);
}

export function readSizeData(): PackageSizeInformation[] | null {
	if (!fs.existsSync(PKGSIZE_DATA)) return null;

	const json = fs.readFileSync(PKGSIZE_DATA, 'utf8');
	return JSON.parse(json);
}

export function saveEsbuildMetafiles(data: PackageSizeInformation[]): void {
	for (const pkg of data) {
		for (const { name, metafile } of pkg.entries) {
			const path = new URL(`${name.replaceAll('/', '__')}-esbuild-metafile.json`, PKGSIZE_FOLDER);
			const json = JSON.stringify(metafile, null, '\t');
			fs.writeFileSync(path, json);
		}
	}
}
