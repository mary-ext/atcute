import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/lexcom/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto'],
});
