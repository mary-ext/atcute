# @atcute/lex-cli

generate TypeScript schemas from lexicon documents.

```sh
npm install @atcute/lex-cli
```

## quick start

create a configuration file that instructs the tool on where to locate the lexicon documents and
where it should put the generated TypeScript schemas:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'src/lexicons/',
	},
});
```

then run the tool (it automatically finds `lex.config.js` or `lex.config.ts`):

```
npm exec lex-cli generate
```

## authoring lexicons with TypeScript

instead of writing lexicons as JSON documents, you can author them programmatically using the
builder functions from `@atcute/lexicon-doc/builder`.

```ts
// file: lexicons-src/com/example/bookmark.ts
import { array, document, object, record, required, string } from '@atcute/lexicon-doc/builder';

export default document({
	id: 'com.example.bookmark',
	defs: {
		main: record({
			key: 'tid',
			description: 'a saved link to come back to later',
			record: object({
				properties: {
					subject: required(string({ format: 'uri' })),
					createdAt: required(string({ format: 'datetime' })),
					tags: array({ items: string(), description: 'tags for organizing bookmarks' }),
				},
			}),
		}),
	},
});
```

update your config to point to TypeScript files:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	generate: {
		files: ['lexicons-src/**/*.ts'],
		outdir: 'src/lexicons/',
	},
});
```

### exporting lexicons to JSON

if you need the actual JSON lexicon documents (e.g., for publishing or sharing), configure the
export command:

```ts
export default defineLexiconConfig({
	generate: {
		files: ['lexicons-src/**/*.ts'],
		outdir: 'src/lexicons/',
	},
	export: {
		outdir: 'lexicons/',
		clean: true,
	},
});
```

then run:

```
npm exec lex-cli export
```

## pulling lexicons

you can pull lexicon files from other sources.

### git sources

pull lexicons from git repositories using sparse checkout:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'src/lexicons/',
	},
	pull: {
		outdir: 'lexicons/',
		clean: true,
		sources: [
			{
				type: 'git',
				remote: 'https://github.com/bluesky-social/atproto.git',
				ref: 'main',
				pattern: ['lexicons/**/*.json'],
			},
		],
	},
});
```

### atproto sources

pull lexicons directly from the AT Protocol network.

```ts
export default defineLexiconConfig({
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'src/lexicons/',
	},
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
				pattern: ['com.atproto.*'], // optional
			},
		],
	},
});
```

### running the pull command

pull the lexicons to disk, then generate types from them:

```
npm exec lex-cli pull
npm exec lex-cli generate
```

## publishing your schemas

if you're packaging your generated schemas as a publishable library, add the `atcute:lexicons` field
to your package.json. this allows other projects to automatically discover and import your schemas
without manual configuration.

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

- `.` or `./` at the start is replaced with the package name (e.g., `./types/foo` becomes
  `@example/my-schemas/types/foo`, or `.` becomes `@example/my-schemas`)
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
	generate: {
		files: ['lexicons/**/*.json'],
		outdir: 'src/lexicons/',
		imports: ['@atcute/atproto', '@atcute/bluesky'],
	},
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
	generate: {
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
	},
});
```
