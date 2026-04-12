import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	formatter: {
		type: 'lsp',
		command: 'oxfmt --lsp',
	},
	generate: {
		files: ['lexicons-src/**/*.ts'],
		outdir: 'lib/lexicons/',
		modules: { importSuffix: '.ts' },
		clean: true,
	},
	export: {
		outdir: 'lexicons/',
		clean: true,
	},
});
