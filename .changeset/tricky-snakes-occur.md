---
'@atcute/lex-cli': minor
---

you can now configure the import suffix that the codegen will generate.

by default, it will continue to use `.js` as the suffix. you can also pass in an empty string for no
suffix at all.

```ts
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	// ... existing config
	modules: {
		importSuffix: '.ts',
	},
});
```
