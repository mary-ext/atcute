import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { untar } from '@mary/tar';
import prettier from 'prettier';

const config = {
	repo: `hyperlink-academy/leaflet`,
	path: `lexicons/pub/leaflet/`,
	out: `lexdocs/leaflet/`,
};

async function main() {
	const prettierConfig = await prettier.resolveConfig(process.cwd() + '/foo', { editorconfig: true });

	let sha;
	{
		console.log(`retrieving latest commit`);
		const response = await fetch(`https://api.github.com/repos/${config.repo}/commits?path=${config.path}/`);

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
		const response = await fetch(`https://github.com/${config.repo}/archive/${sha}.tar.gz`);

		if (!response.ok) {
			console.log(`  response error ${response.status}`);
			return;
		}

		const reponame = config.repo.replace(/^.*?\//, '');
		const basename = `${reponame}-${sha}/${config.path}`;

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
					const formatted = await prettier.format(code, { ...prettierConfig, parser: 'json' });

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
		const source = `https://github.com/${config.repo}/tree/${sha}/${config.path}\n`;

		console.log(`writing readme file`);

		await fs.writeFile(tmpdir + `README.md`, source);
	}

	{
		console.log(`moving folder`);

		await fs.rm(config.out, { recursive: true, force: true });
		await fs.rename(tmpdir, config.out);
	}
}

await main();
