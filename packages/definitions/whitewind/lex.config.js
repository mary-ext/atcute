import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	formatter: {
		type: 'lsp',
		command: 'oxfmt --lsp',
		passes: 2,
	},
	generate: {
		files: ['lexicons/com/whtwnd/**/*.json'],
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
				remote: 'https://github.com/whtwnd/whitewind-blog.git',
				pattern: ['lexicons/com/whtwnd/**/*.json'],
			},
		],
	},
});
