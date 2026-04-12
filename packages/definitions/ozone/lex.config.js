import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'lib/lexicons/',
	modules: { importSuffix: '.ts' },
	formatter: { type: 'lsp', command: 'oxfmt --lsp' },
	generate: { clean: true },
	imports: ['@atcute/atproto', '@atcute/bluesky'],

	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'git',
				remote: 'https://github.com/bluesky-social/atproto.git',
				pattern: ['lexicons/tools/ozone/**/*.json'],
			},
		],
	},
});
