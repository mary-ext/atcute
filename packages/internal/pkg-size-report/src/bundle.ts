import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as url from 'node:url';
import * as esbuild from 'esbuild';

import { computeFolderSize } from './fs.js';

export function computeBundleInformation(entry: URL, entryQualifier: string, keepBuild = false) {
	const tmpDirPrefix = path.join(
		os.tmpdir(),
		`atcute-pkg-size-build--${entryQualifier.replaceAll('/', '__')}--`,
	);

	const tmpDir = fs.mkdtempSync(tmpDirPrefix);

	const { metafile } = esbuild.buildSync({
		bundle: true,
		minify: true,
		outdir: tmpDir,
		metafile: true,
		entryPoints: [url.fileURLToPath(entry)],
	});

	const tmpDirUrl = url.pathToFileURL(tmpDir);
	const bundledSize = computeFolderSize(tmpDirUrl, true);

	if (!keepBuild) fs.rmSync(tmpDir, { recursive: true });

	return {
		metafile,
		...bundledSize,
	};
}
