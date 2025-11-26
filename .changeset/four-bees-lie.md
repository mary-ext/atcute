---
'@atcute/lex-cli': patch
---

add atproto pull source

you can now pull lexicons directly from the AT Protocol network

```ts
export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	pull: {
		outdir: 'lexicons/',
		sources: [
			{
				type: 'atproto',
				mode: 'nsids',
				nsids: ['app.bsky.feed.post', 'app.bsky.actor.profile'],
			},
			{
				type: 'atproto',
				mode: 'authority',
				authority: 'atproto-lexicons.bsky.social',
				pattern: ['com.atproto.*'],
			},
		],
	},
});
```
