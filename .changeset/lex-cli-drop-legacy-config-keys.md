---
'@atcute/lex-cli': major
---

drop the deprecated top-level `outdir`, `files`, `imports`, `mappings`, and `modules` keys from
`LexiconConfig`

move them under `generate.*`.

```ts
// before
defineLexiconConfig({
	outdir: './src/lexicons',
	files: ['./lexicons/**/*.json'],
});

// after
defineLexiconConfig({
	generate: {
		outdir: './src/lexicons',
		files: ['./lexicons/**/*.json'],
	},
});
```
