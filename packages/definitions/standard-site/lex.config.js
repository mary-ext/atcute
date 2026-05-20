import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	formatter: {
		type: 'lsp',
		command: 'oxfmt --lsp',
		passes: 2,
	},
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'lib/lexicons/',
		modules: { importSuffix: '.ts' },
		imports: ['@atcute/atproto'],
		clean: true,
	},
	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'atproto',
				mode: 'authority',
				authority: 'standard.site',
			},
		],
	},
});
