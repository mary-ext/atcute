import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	formatter: {
		type: 'lsp',
		command: 'oxfmt --lsp',
		passes: 2,
	},
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'lib/lexicons/',
		modules: { importSuffix: '.ts' },
		imports: ['@atcute/atproto', '@atcute/bluesky'],
		clean: true,
	},
	// pull: {
	// 	outdir: 'lexicons/',
	// 	clean: true,
	// 	sources: [
	// 		{
	// 			type: 'git',
	// 			remote: 'https://github.com/aendra-rininsland/bluemoji.git',
	// 			pattern: ['schema/**/*.json'],
	// 		},
	// 	],
	// },
});
