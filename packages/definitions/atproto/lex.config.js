import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexicons/com/atproto/**/*.json'],
	outdir: 'lib/lexicons/',
});
