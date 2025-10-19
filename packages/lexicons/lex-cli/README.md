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

## publishing your schemas

if you're packaging your generated schemas as a publishable library, add the `atcute:lexicons`
field to your package.json. this allows other projects to automatically discover and import your
schemas without manual configuration.

```json
{
	"name": "@example/my-schemas",
	"atcute:lexicons": {
		"mappings": {
			"com.example.*": {
				"type": "namespace",
				"path": "./types/{{nsid_remainder}}"
			}
		}
	}
}
```

the `path` field supports several template expansions:

- `./` at the start is replaced with the package name (e.g., `./types/foo` becomes
  `@example/my-schemas/types/foo`)
- `{{nsid}}` - the full NSID with dots replaced by slashes (e.g., `com/example/foo/bar`)
- `{{nsid_prefix}}` - the part before the wildcard (e.g., `com/example`)
- `{{nsid_remainder}}` - the part after the prefix (e.g., `foo/bar`)

## external references

when your lexicons reference types from namespaces outside your configured files, you'll need to
configure how these references are resolved.

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

the simplest way to resolve external references is using the `imports` array with packages that
provide the `atcute:lexicons` metadata:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/atproto', '@atcute/bluesky'],
});
```

the CLI will automatically discover the namespace mappings from each package's `atcute:lexicons`
field in their package.json.

for packages without metadata, or when you need more fine-grained control over import resolution,
use the `mappings` configuration instead:

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
