import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'lib/lexicons/',
	modules: { importSuffix: '.ts' },
	formatter: { type: 'command', command: 'oxfmt --stdin-filepath={filepath}' },
	imports: ['@atcute/atproto'],

	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'git',
				remote: 'https://github.com/frontpagefyi/frontpage.git',
				pattern: ['lexicons/**/*.json', '!lexicons/com/atproto/**'],
			},
		],
	},
});
