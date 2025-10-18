import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/leaflet/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto'],
});
