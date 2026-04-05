import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'lib/lexicons/',
	modules: { importSuffix: '.ts' },
	formatter: { type: 'lsp', command: 'oxfmt --lsp' },
	imports: ['@atcute/atproto'],

	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'git',
				remote: 'https://github.com/hyperlink-academy/leaflet.git',
				pattern: ['lexicons/pub/leaflet/**/*.json'],
			},
		],
	},
});
