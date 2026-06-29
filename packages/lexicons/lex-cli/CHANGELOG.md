# @atcute/lex-cli

## 3.2.0

### Minor Changes

- b141b0b: use kempt as the default code formatter

  kempt is a small code formatter that only formats whitespaces and leaves everything else exactly
  as written. making it a good option for generated code, where the only concern is consistent and
  auditable code.

  if prettier is still preferred, use you can configure the `formatter` option to use Prettier. note
  that you would need to install `prettier` as a dependency if you don't have it already.

  ```ts
  import { defineLexiconConfig } from '@atcute/lex-cli';

  export default defineLexiconConfig({
  	formatter: { type: 'prettier' },
  });
  ```

## 3.1.0

### Minor Changes

- ad5dee4: add a `passes` option to the formatter config, repeating formatting a fixed number of
  times or, with `'auto'`, until the output stabilizes

## 3.0.1

### Patch Changes

- 916ff5f: canonicalize set-like arrays on pull

## 3.0.0

### Major Changes

- b094191: drop the deprecated top-level `outdir`, `files`, `imports`, `mappings`, and `modules`
  keys from `LexiconConfig`

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

### Patch Changes

- 4da15ec: migrate internal config and metadata schemas from `@badrap/valita` to `valibot`. exported
  types remain structurally compatible.
- 898dbc4: write pulled lexicons in canonical key order

  `lex-cli pull` now sorts keys into dag-cbor canonical order (shorter keys first, then
  lexicographic) so output stays deterministic regardless of schema field declaration order.

- Updated dependencies [f45af74]
- Updated dependencies [6aa06fb]
- Updated dependencies [1437627]
- Updated dependencies [8d4aebc]
- Updated dependencies [cf19d96]
- Updated dependencies [d64ddf1]
  - @atcute/identity@2.0.0
  - @atcute/identity-resolver@2.0.0
  - @atcute/lexicon-doc@3.0.0
  - @atcute/lexicons@2.0.0
  - @atcute/lexicon-resolver@1.0.0

## 2.8.2

### Patch Changes

- 58d124c: make `formatter` optional in `LexiconConfig`. it defaults to `{ type: 'prettier' }` when
  omitted.

## 2.8.1

### Patch Changes

- e879572: lazily import comamnds

## 2.8.0

### Minor Changes

- f652050: add `clean` option to generate command
- 4e73cfd: move generate configs over to `generate` field

### Patch Changes

- 3ef08ad: use Node.js module resolution to resolve lexicon imports
- d01ad16: always clean up temporary Git repository clones

## 2.7.0

### Minor Changes

- 22b5181: emit blob size and accept constraints in codegen

### Patch Changes

- f6cf57b: simplify blob accept constraints by removing specific types covered by wildcards
- Updated dependencies [a737a3a]
- Updated dependencies [b36d1a8]
- Updated dependencies [94065a1]
  - @atcute/lexicon-doc@2.2.0
  - @atcute/lexicons@1.3.0

## 2.6.1

### Patch Changes

- 0463405: set default external concurrency to 1
- 9197920: add lsp formatter support
- d75f712: do not run prettier concurrently
- Updated dependencies [2022754]
  - @atcute/lexicons@1.2.10

## 2.6.0

### Minor Changes

- 8d5f575: external formatter support

## 2.5.3

### Patch Changes

- bfebed5: make use of lexicon-doc's new ref parsing utilities
- Updated dependencies [e73fddf]
- Updated dependencies [066bc16]
- Updated dependencies [2c386c7]
  - @atcute/lexicons@1.2.7
  - @atcute/lexicon-doc@2.1.0

## 2.5.2

### Patch Changes

- 6f5906f: only generate files with contents

## 2.5.1

### Patch Changes

- 387b291: do not pass URL instances to fetch()

## 2.5.0

### Minor Changes

- 67d570c: generate code from lexicon builders

  you can now author lexicons with `@atcute/lexicon-doc/builder` and have lex-cli consume them
  directly!

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
  					tags: array({
  						items: string(),
  						description: 'tags for organizing bookmarks',
  					}),
  				},
  			}),
  		}),
  	},
  });
  ```

  update your `files` array to point to the TypeScript/JavaScript source files and it'll import them
  and build it for you.

  ```ts
  export default defineLexiconConfig({
  	files: ['lexicons-src/**/*.ts'],
  	outdir: 'src/lexicons/',
  });
  ```

  if you want to get the actual lexicon documents out of them, you can configure the export command
  and run `lex-cli export`.

  ```ts
  export default defineLexiconConfig({
  	files: ['lexicons-src/**/*.ts'],
  	outdir: 'src/lexicons/',
  	export: {
  		outdir: 'lexicons/',
  		clean: true,
  	},
  });
  ```

### Patch Changes

- cba74d3: add atproto pull source

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

- 7f63ece: add config auto-discovery

  given that config files are pretty much a required part of lex-cli, the CLI tool now attempts to
  search for the presence of `lex.config.js` or `lex.config.ts` when a config file is not explicitly
  specified.

- Updated dependencies [90690b8]
  - @atcute/lexicon-doc@2.0.3

## 2.4.0

### Minor Changes

- 4ade55d: add pull command functionality

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

### Patch Changes

- @atcute/lexicon-doc@2.0.2

## 2.3.3

### Patch Changes

- 860334b: validate lex.config.js
- a612431: align with latest lexicon-doc types
- Updated dependencies [4a7e8dc]
- Updated dependencies [d319bb1]
- Updated dependencies [d319bb1]
- Updated dependencies [2d7c5d8]
- Updated dependencies [082683e]
  - @atcute/lexicon-doc@2.0.0

## 2.3.2

### Patch Changes

- e2970ab: allow setting default value for const/enum values
- Updated dependencies [d53a847]
- Updated dependencies [e8e4f43]
- Updated dependencies [053958e]
  - @atcute/lexicon-doc@1.2.0

## 2.3.1

### Patch Changes

- 8c5ec99: remove Valibot, consistently use Valita
- Updated dependencies [d901d8a]
- Updated dependencies [c603d16]
- Updated dependencies [84b135f]
  - @atcute/lexicon-doc@1.1.4

## 2.3.0

### Minor Changes

- 9e48104: add package.json-based lexicon import metadata

  instead of manually configuring mappings:

  ```js
  mappings: [
  	{
  		nsid: ['com.atproto.*'],
  		imports: (nsid) => {
  			const specifier = nsid.slice('com.atproto.'.length).replaceAll('.', '/');
  			return {
  				type: 'namespace',
  				from: `@atcute/atproto/types/${specifier}`,
  			};
  		},
  	},
  ];
  ```

  you can now simply write:

  ```js
  imports: ['@atcute/atproto'];
  ```

  the package metadata is automatically discovered and used for import resolution.

  for lexicon definition packages, add an `atcute:lexicons` field to your package.json with NSID
  patterns mapped to import paths:

  ```json
  {
  	"atcute:lexicons": {
  		"mappings": {
  			"com.atproto.*": {
  				"type": "namespace",
  				"path": "./types/{{nsid_remainder}}"
  			}
  		}
  	}
  }
  ```

  the CLI discovers these mappings from packages listed in the `imports` array. available template
  expansions:
  - `.` or `./` at the start of the path is replaced with the package name (e.g., `./types/foo`
    becomes `@atcute/atproto/types/foo`, or `.` becomes `@atcute/atproto`)
  - `{{nsid}}` is replaced with the full NSID (e.g., `com/atproto/sync/subscribeRepos`)
  - `{{nsid_prefix}}` is replaced with the part before the wildcard (e.g., `com/atproto`)
  - `{{nsid_remainder}}` is replaced with the part after the prefix (e.g., `sync/subscribeRepos`)

### Patch Changes

- 93b3e0a: switch from Clipanion to Optique

  lex-cli was previously using my personal fork of Clipanion and I wasn't quite interested in
  maintaining it any longer.

## 2.2.2

### Patch Changes

- e23f15c: missing default value for literal enums
- 8f4bd4b: add JSDoc to object fields

## 2.2.1

### Patch Changes

- b30da0e: add `declarationMap` to tsconfig
- Updated dependencies [b30da0e]
  - @atcute/lexicon-doc@1.1.2

## 2.2.0

### Minor Changes

- 3a5bc47: you can now configure the import suffix that the codegen will generate.

  by default, it will continue to use `.js` as the suffix. you can also pass in an empty string for
  no suffix at all.

  ```ts
  import { defineLexiconConfig } from '@atcute/lex-cli';

  export default defineLexiconConfig({
  	// ... existing config
  	modules: {
  		importSuffix: '.ts',
  	},
  });
  ```

## 2.1.1

### Patch Changes

- 43e5d06: use file protocol when importing config files

## 2.1.0

### Minor Changes

- e8592d0: bring back convenient interfaces for XRPC operations

  in hindsight, it was a big mistake making substituting `AppBskyFeedGetTimeline.Output` for
  `InferXRPCBodyInput<AppBskyFeedGetTimeline.mainSchema['output']>`!

  the change was prompted because lexicon documents do not reserve names for the code generator's
  types, you could have a document defining a query and a type named `output`, and you'd basically
  wreck havoc on the codegen itself.

  but clearly these convenient interfaces are still worth having, so while it now exists, the
  compromise is that these interfaces now have been renamed to ensure they don't conflict with any
  definitions ever:
  - `Params` to `$params`, for query parameters
  - `Input` to `$input`, for request body
  - `Output` to `$output`, for response body

## 2.0.3

### Patch Changes

- 30ccef3: set a minimum constraint of 1 array items for XRPC parameters
- Updated dependencies [3efa702]
  - @atcute/lexicon-doc@1.0.2

## 2.0.2

### Patch Changes

- e2d3d00: ensure object properties, enums, and other sortable items are sorted
- dd5b42f: show overall validation error message
- 1b1bd64: CID-formatted strings should be validated

  somehow missed this

## 2.0.1

### Patch Changes

- 480e58b: missing pure annotation on constrained arrays
- 69db9c7: include expected content-type in xrpc operation schema
- Updated dependencies [2249c88]
  - @atcute/lexicon-doc@1.0.1

## 2.0.0

### Major Changes

- 2ca2d0c: New lexicon code generator

## 1.1.2

### Patch Changes

- 7a125f1: relaxed string schema rules

## 1.1.1

### Patch Changes

- 287a157: account for unions with no members

## 1.1.0

### Minor Changes

- 9d05dfd: add `At.RecordKey` string type

  this is currently an alias to `string` for now.

- 13f35e4: allow passing ReadableStream and ArrayBuffer as input
- a47373f: add `At.Identifier` string type

  an alias for either `At.DID` or `At.Handle`

- 2d10bd8: add `At.CanonicalResourceUri` string type
- 8aedcc5: `At.Did` now contains a `TMethod` type parameter for specifying DID methods in the
  identifier.
- 45cfe46: add new response field, deprecating the old output field
- 813679f: add `At.Nsid` string type

  this is a specialized type for `nsid` formatted strings, where there were previously none.

- 24be9be: `At.Handle` string type is now stricter
- d3fbc7e: consistent casing on types and interfaces

  no more capitalized/pascalcase mixing, these following types are renamed:
  - `At.CID` → `At.Cid`
  - `At.CIDLink` → `At.CidLink`
  - `At.DID` → `At.Did`

- c7e8573: add `At.ResourceUri` string type

  this is a specialized type for `at-uri` formatted strings, replacing the previous `At.Uri` string

- 61bd8d2: add `At.GenericUri` string type

  this is a specialized type for `uri` formatted strings, where there were previously none.

- 87a99f1: add `At.Tid` string type

  this is currently an alias to string for now, but it can be made stricter later.

### Patch Changes

- e278e91: clean up string format handling
- 45cc699: clean up base types JSDoc
