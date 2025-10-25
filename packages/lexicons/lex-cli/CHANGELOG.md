# @atcute/lex-cli

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
  			return { type: 'namespace', from: `@atcute/atproto/types/${specifier}` };
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
