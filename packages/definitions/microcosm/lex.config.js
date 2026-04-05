import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons-src/**/*.ts'],
	outdir: 'lib/lexicons/',
	modules: { importSuffix: '.ts' },
	formatter: { type: 'lsp', command: 'oxfmt --lsp' },
	export: {
		outdir: 'lexicons/',
		clean: true,
	},
});
