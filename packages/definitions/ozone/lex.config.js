import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['../../../lexicons/tools/ozone/**/*.json'],
	outdir: 'lib/lexicons/',
	mappings: [
		{
			nsid: ['com.atproto.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('com.atproto.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/atproto/types/${specifier}` };
			},
		},
		{
			nsid: ['app.bsky.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('app.bsky.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/bluesky/types/app/${specifier}` };
			},
		},
		{
			nsid: ['chat.bsky.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('chat.bsky.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/bluesky/types/chat/${specifier}` };
			},
		},
	],
});
