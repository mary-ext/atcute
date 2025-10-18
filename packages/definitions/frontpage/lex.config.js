import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/frontpage/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto'],
});
