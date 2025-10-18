import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/bluesky/tools/ozone/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto', '@atcute/bluesky'],
});
