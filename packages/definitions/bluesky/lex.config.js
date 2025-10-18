import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexdocs/bluesky/app/bsky/**/*.json', '../../../lexdocs/bluesky/chat/bsky/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto'],
});
