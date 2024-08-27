import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { untar } from '@mary/tar';
import prettier from 'prettier';

const repo = `aendra-rininsland/bluemoji`;

async function main() {
	const config = await prettier.resolveConfig(process.cwd() + '/foo', { editorconfig: true });

	let sha;
	{
		console.log(`retrieving latest commit`);
		const response = await fetch(`https://api.github.com/repos/${repo}/commits?path=schema/`);

		if (!response.ok) {
			console.log(`  response error ${response.status}`);
			return;
		}

		const json = await response.json();
		const latest = json[0];

		if (!latest) {
			console.log(`  latest commit missing?`);
			return;
		}

		sha = latest.sha;
		console.log(`  got ${sha}`);
	}

	const tmpdir = `lexicons-tmp/`;

	{
		console.log(`retrieving zip file`);
		const response = await fetch(`https://github.com/${repo}/archive/${sha}.tar.gz`);

		if (!response.ok) {
			console.log(`  response error ${response.status}`);
			return;
		}

		const basename = `bluemoji-${sha}/schema/`;

		const ds = new DecompressionStream('gzip');
		const stream = response.body.pipeThrough(ds);

		const promises = [];

		console.log(`  reading`);
		for await (const entry of untar(stream)) {
			if (entry.type === 'file' && entry.name.startsWith(basename) && entry.name.endsWith('.json')) {
				const name = entry.name.slice(basename.length);
				const basedir = tmpdir + path.dirname(name);

				const code = await entry.text();

				const promise = (async () => {
					const formatted = await prettier.format(code, { ...config, parser: 'json' });

					await fs.mkdir(basedir, { recursive: true });
					await fs.writeFile(tmpdir + name, formatted);
				})();

				promises.push(promise);
			}
		}

		console.log(`  flushing writes`);
		await Promise.all(promises);
	}

	{
		const source = `https://github.com/${repo}/tree/${sha}/schema\n`;

		console.log(`writing readme file`);

		await fs.writeFile(tmpdir + `README.md`, source);
	}

	{
		const dest = `lexicons-bluemoji/`;

		console.log(`moving folder`);

		await fs.rm(dest, { recursive: true, force: true });
		await fs.rename(tmpdir, dest);
	}
}

await main();
