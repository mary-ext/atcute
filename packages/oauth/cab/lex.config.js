import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons-src/**/*.ts'],
	outdir: 'lib/lexicons/',
	export: {
		outdir: 'lexicons/',
		clean: true,
	},
});
