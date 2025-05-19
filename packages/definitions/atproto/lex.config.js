import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/bluesky/com/atproto/**/*.json'],
	outdir: 'lib/lexicons/',
});
