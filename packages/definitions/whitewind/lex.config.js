import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/whtwnd/**/*.json'],
	outdir: 'lib/lexicons/',
	mappings: [],
});
