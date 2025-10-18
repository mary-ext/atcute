import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/tangled/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto'],
});
