---
'@atcute/lex-cli': minor
---

add pull command functionality

this is useful if you're consuming someone else's lexicons

```js
// lex.config.js
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
				type: 'git',
				remote: 'https://github.com/bluesky-social/atproto.git',
				pattern: ['lexicons/app/bsky/**/*.json', 'lexicons/chat/bsky/**/*.json'],
			},
		],
	},
});
```

then run

```
pnpm lex-cli pull -c lex.config.js
```
