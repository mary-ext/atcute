import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexicons-whtwnd/**/*.json'],
	outdir: 'lib/lexicons/',
	mappings: [],
});
