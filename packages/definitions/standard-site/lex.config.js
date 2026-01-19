import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'lib/lexicons/',
	imports: ['@atcute/atproto'],

	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'atproto',
				mode: 'authority',
				authority: 'standard.site',
			},
		],
	},
});
