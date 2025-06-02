# @atcute/lex-cli

command line tool for generating TypeScript schemas out of lexicon documents

## quick start

create a configuration file that instructs the tool on where to locate the lexicon documents and
where it should put the generated TypeScript schemas:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
});
```

then run the tool:

```
npm exec lex-cli generate -c ./lex.config.js
```

highly recommend packaging the generated schemas as a publishable library for others to use.
