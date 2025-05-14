import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexicons-frontpage/**/*.json'],
	outdir: 'lib/lexicons/',
	mappings: [
		{
			nsid: ['com.atproto.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('com.atproto.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/atproto/types/${specifier}` };
			},
		},
	],
});
