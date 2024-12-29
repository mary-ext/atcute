import pc from 'picocolors';
import { computePackageSizeInformation, getAllWorkspacePackages } from './package.js';
import { readSizeData, saveEsbuildMetafiles, saveSizeData } from './data.js';
import { computeSizeDiff } from './diff.js';

const TREE_SYM_HAS_NEXT = '├';
const TREE_SYM_FINAL = '└';

const FLAG_SAVE = process.argv.includes('--save');
const FLAG_SAVE_META = process.argv.includes('--save-meta');
const FLAG_COMPARE = process.argv.includes('--compare');
const FLAG_KEEP_BUILDS = process.argv.includes('--keep-builds');

function formatSize(size: number) {
	return `${(size / 1000).toFixed(2)}kB`.padEnd(7, ' ');
}

function formatDiffSize(size: number) {
	const str = Math.abs(size) < 1000 ? `${size}B` : `${(size / 1000).toFixed(3)}kB`;
	return size < 0 ? pc.green(str) : pc.red(`+${str}`);
}

// Get package info
const packages = getAllWorkspacePackages();
const sizeData = packages.map((pkg) => computePackageSizeInformation(pkg, FLAG_KEEP_BUILDS));

// Compute diff if applicable
const prevData = readSizeData();
const diff = prevData && computeSizeDiff(sizeData, prevData);

// Save files
if (FLAG_SAVE) saveSizeData(sizeData);
if (FLAG_SAVE || FLAG_SAVE_META) saveEsbuildMetafiles(sizeData);

// Print to stdout.
for (const pkg of sizeData) {
	const pkgDiff = diff?.[pkg.name];
	if (FLAG_COMPARE && pkgDiff?.diff === 0) continue;

	let pkgInfo = `${pkg.name.padEnd(34, ' ')}\t${formatSize(pkg.installSize).padEnd(8, ' ')} ${pc.gray('install size')}`;
	if (pkgDiff?.diff) pkgInfo += `    ${formatDiffSize(pkgDiff.diff)}`;

	console.log(pkgInfo);

	for (let i = 0; i < pkg.entries.length; i++) {
		const entry = pkg.entries[i];
		const entryDiff = pkgDiff?.entries[entry.name];

		const size = formatSize(entry.size);
		const gzip = `${formatSize(entry.gzip)} ${pc.gray('gzip')}`;
		const brotli = `${formatSize(entry.brotli)} ${pc.gray('brotli')}`;

		const treeSym = i === pkg.entries.length - 1 ? TREE_SYM_FINAL : TREE_SYM_HAS_NEXT;
		let entryInfo = `${treeSym}── ${entry.name.padEnd(30, ' ')}\t${treeSym}── ${size}\t${gzip}\t${brotli}`;
		if (entryDiff?.diff) {
			const size = formatDiffSize(entryDiff.diff);
			const gzip = formatDiffSize(entryDiff.gzip);
			const brotli = formatDiffSize(entryDiff.brotli);
			entryInfo += `    ${size}/${gzip}/${brotli}`;
		}

		console.log(entryInfo);
	}

	console.log();
}
