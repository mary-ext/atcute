---
'@atcute/lex-cli': minor
---

generate code from lexicon builders

you can now author lexicons with `@atcute/lexicon-doc/builder` and have lex-cli consume them
directly! update your `files` array to point to the TypeScript/JavaScript source files and it'll
import them and build it for you.

```ts
export default defineLexiconConfig({
	files: ['lexicons-src/**/*.ts'],
	// ...
});
```

if you want to get the actual lexicon documents out of them, you can configure the export command.

```ts
export default defineLexiconConfig({
	// ...
	export: {
		outdir: 'lexicons/',
		clean: true,
	},
});
```
