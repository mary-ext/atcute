# @atcute/lex-cli

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
