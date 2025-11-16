import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/microcosm/**/*.json'],
	outdir: 'lib/lexicons/',
});
