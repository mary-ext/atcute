import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/com/whtwnd/**/*.json'],
	outdir: 'lib/lexicons/',

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
