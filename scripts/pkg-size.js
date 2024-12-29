import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import * as url from 'node:url';
import * as esbuild from 'esbuild';
import { load as parseYaml } from 'js-yaml';
import pc from 'picocolors';

const WORKSPACE_ROOT = new URL('../', import.meta.url);
const PKGSIZE_FOLDER = new URL('.pkgsize/', WORKSPACE_ROOT);
const PKGSIZE_DATA = new URL(`data.json`, PKGSIZE_FOLDER);

const err = (msg) => {
	throw new Error(msg);
};

function formatSize(size) {
	return `${(size / 1000).toFixed(2)}kB`.padEnd(7, ' ');
}

function formatDiff(size) {
	const str = Math.abs(size) < 1000 ? `${size}B` : `${(size / 1000).toFixed(3)}kB`;
	return size < 0 ? pc.green(str) : pc.red(`+${str}`);
}

function computeFolderSize(folder, detailed = false) {
	folder.pathname += '/';
	let res = { size: 0, gzip: 0, brotli: 0 };

	for (const entry of fs.readdirSync(folder)) {
		const path = new URL(entry, folder);
		const stat = fs.statSync(path);

		if (stat.isDirectory()) {
			const nested = computeFolderSize(path);
			res.size += nested.size;
			res.gzip += nested.gzip;
			res.brotli += nested.brotli;
		}

		if (stat.isFile()) {
			res.size += stat.size;
			if (detailed) {
				const buf = fs.readFileSync(path);
				const gzipBuf = zlib.gzipSync(buf);
				const brotliBuf = zlib.brotliCompressSync(buf);
				res.gzip += gzipBuf.length;
				res.brotli += brotliBuf.length;
			}
		}
	}

	return res;
}

export function computePackageSizes() {
	const results = [];

	const pnpmLockfileYaml = fs.readFileSync(new URL('pnpm-lock.yaml', WORKSPACE_ROOT));
	const pnpmLockfile = parseYaml(pnpmLockfileYaml) ?? err('could not parse yaml??');
	const packages = Object.keys(pnpmLockfile.importers);

	for (const pkgPath of packages) {
		const PKG_BASE = new URL(`${pkgPath}/`, WORKSPACE_ROOT);

		const pkgJson = fs.readFileSync(new URL('package.json', PKG_BASE));
		const pkg = JSON.parse(pkgJson);
		if (pkg.private) continue;

		const dist = new URL('dist', PKG_BASE);
		const packageResults = {
			name: pkg.name,
			installSize: computeFolderSize(dist).size,
			entries: [],
		};

		const pkgExports = pkgPath.includes('definitions') || !pkg.exports ? {} : pkg.exports;
		for (const entrypoint in pkgExports) {
			if (!Object.hasOwn(pkgExports, entrypoint)) continue;

			const importQualifier = pkg.name + entrypoint.slice(1);
			const entryFile = new URL(pkgExports[entrypoint], PKG_BASE);

			const tmpDirPrefix = path.join(
				os.tmpdir(),
				`atcute-pkg-size-build--${pkg.name.replaceAll('/', '__')}--`,
			);
			const tmpDir = fs.mkdtempSync(tmpDirPrefix);

			const { metafile } = esbuild.buildSync({
				bundle: true,
				minify: true,
				outdir: tmpDir,
				metafile: true,
				entryPoints: [url.fileURLToPath(entryFile)],
			});

			const tmpDirUrl = url.pathToFileURL(tmpDir);
			const bundledSize = computeFolderSize(tmpDirUrl, true);
			packageResults.entries.push({ entrypoint: importQualifier, ...bundledSize, metafile });

			if (!process.argv.includes('--keep-builds')) {
				fs.rmSync(tmpDir, { recursive: true });
			}
		}

		results.push(packageResults);
	}

	return results;
}

export function compareSizes(data) {
	if (!fs.existsSync(PKGSIZE_DATA)) return;
	const prevDataJson = fs.readFileSync(PKGSIZE_DATA, 'utf8');
	const prevData = JSON.parse(prevDataJson);

	for (const pkg of data) {
		const prevPkg = prevData.find((p) => p.name === pkg.name);
		if (!prevPkg) continue;

		pkg.diff = pkg.installSize - prevPkg.installSize;

		for (const entry of pkg.entries) {
			const prevEntry = prevPkg.entries.find((e) => e.entrypoint === entry.entrypoint);
			if (!prevEntry) continue;

			entry.diff = {
				size: entry.size - prevEntry.size,
				gzip: entry.gzip - prevEntry.gzip,
				brotli: entry.brotli - prevEntry.brotli,
			};
		}
	}
}

export function savePkgSizes(data) {
	fs.mkdirSync(PKGSIZE_FOLDER, { recursive: true });

	for (const pkg of data) {
		for (const entry of pkg.entries) {
			const metafile = entry.metafile;
			delete entry.metafile;

			const json = JSON.stringify(metafile, null, '\t');
			fs.writeFileSync(
				new URL(`${entry.entrypoint.replaceAll('/', '__')}-esbuild-metafile.json`, PKGSIZE_FOLDER),
				json,
			);
		}
	}

	if (process.argv.includes('--save')) {
		const json = JSON.stringify(data, null, '\t');
		fs.writeFileSync(PKGSIZE_DATA, json);
	}
}

if (import.meta.resolve(process.argv[1]) === import.meta.url) {
	const TREE_SYM_HAS_NEXT = '├';
	const TREE_SYM_FINAL = '└';

	const results = computePackageSizes();
	if (!process.argv.includes('--save')) compareSizes(results);

	for (const pkg of results) {
		if (process.argv.includes('--compare') && pkg.diff === 0) continue;

		let pkgInfo = `${pkg.name.padEnd(34, ' ')}\t${formatSize(pkg.installSize).padEnd(8, ' ')} ${pc.gray('install size')}`;
		if (pkg.diff) pkgInfo += `    ${formatDiff(pkg.diff)}`;

		console.log(pkgInfo);

		for (let i = 0; i < pkg.entries.length; i++) {
			const entry = pkg.entries[i];
			const treeSym = i === pkg.entries.length - 1 ? TREE_SYM_FINAL : TREE_SYM_HAS_NEXT;

			const size = formatSize(entry.size);
			const gzip = `${formatSize(entry.gzip)} ${pc.gray('gzip')}`;
			const brotli = `${formatSize(entry.brotli)} ${pc.gray('brotli')}`;

			let entryInfo = `${treeSym}── ${entry.entrypoint.padEnd(30, ' ')}\t${treeSym}── ${size}\t${gzip}\t${brotli}`;
			if (entry.diff?.size) {
				const size = formatDiff(entry.diff.size);
				const gzip = formatDiff(entry.diff.gzip);
				const brotli = formatDiff(entry.diff.brotli);
				entryInfo += `    ${size}/${gzip}/${brotli}`;
			}
			console.log(entryInfo);
		}

		console.log();
	}

	if (process.argv.includes('--save') || process.argv.includes('--save-meta')) {
		savePkgSizes(results);
	}
}
