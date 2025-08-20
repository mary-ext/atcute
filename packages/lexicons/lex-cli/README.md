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

## external references

when your lexicons reference types from namespaces outside your configured files, you'll need to
configure mappings to resolve these references.

for example, if your lexicon references a type from another namespace:

```jsonc
// file: lexdocs/tools/ozone/team/defs.json
{
	"lexicon": 1,
	"id": "tools.ozone.team.defs",
	"defs": {
		"member": {
			"type": "object",
			"required": ["did", "role"],
			"properties": {
				"profile": {
					"type": "ref",
					"ref": "app.bsky.actor.defs#profileViewDetailed",
					//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
					//     not covered by any of our included files
				},
			},
		},
	},
}
```

define mappings in your configuration to specify how external namespaces should be imported:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
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
	],
});
```

with this configuration, any reference to a lexicon in the `com.atproto.*` or `app.bsky.*` namespace
will be imported from `@atcute/atproto` or `@atcute/bluesky`, respectively.
