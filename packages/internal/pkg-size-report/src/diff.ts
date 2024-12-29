import type { PackageSizeInformation } from './data.js';

export interface DiffInformation {
	[key: string]: {
		diff: number;
		entries: {
			[key: string]: { diff: number; gzip: number; brotli: number };
		};
	};
}

export function computeSizeDiff(
	data: PackageSizeInformation[],
	old: PackageSizeInformation[],
): DiffInformation {
	const diff: DiffInformation = {};
	for (const pkg of data) {
		const oldPkg = old.find((p) => p.name == pkg.name);
		if (!oldPkg) continue;

		diff[pkg.name] = { diff: pkg.installSize - oldPkg.installSize, entries: {} };
		for (const entry of pkg.entries) {
			const oldEntry = oldPkg.entries.find((e) => e.name === entry.name);
			if (!oldEntry) continue;

			diff[pkg.name].entries[entry.name] = {
				diff: entry.size - oldEntry.size,
				gzip: entry.gzip - oldEntry.gzip,
				brotli: entry.brotli - oldEntry.brotli,
			};
		}
	}

	return diff;
}
