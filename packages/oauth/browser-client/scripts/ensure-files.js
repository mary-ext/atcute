// this script makes sure that `@atcute/atproto` and `@atcute/bluesky` never
// makes it into the generated d.ts file, as it'd mean we'd have to include it
// as a peer dependency.

import * as fs from 'node:fs/promises';

const PATTERN_RE = / from ['"](@atcute\/atproto)['"/]/;
const files = [];

for await (const filename of fs.glob('dist/**/*.d.ts')) {
	const content = await fs.readFile(filename, 'utf8');

	if (PATTERN_RE.test(content)) {
		files.push(filename);
	}
}

if (files.length > 0) {
	console.error(`found ${files.length} files referencing a dev dependency`);

	for (const file of files) {
		console.error(`- ${file}`);
	}

	process.exit(1);
} else {
	console.error(`output ok!`);
}
