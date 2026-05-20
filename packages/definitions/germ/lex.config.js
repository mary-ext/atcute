import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	formatter: {
		type: 'lsp',
		command: 'oxfmt --lsp',
	},
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'lib/lexicons/',
		modules: { importSuffix: '.ts' },
		clean: true,
	},
	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'git',
				remote: 'https://github.com/germ-network/lexicon.git',
				pattern: ['lexicons/com/germnetwork/**/*.json'],
			},
		],
	},
});
