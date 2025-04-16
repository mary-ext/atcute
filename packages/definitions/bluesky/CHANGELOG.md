# @atcute/bluesky

## 2.0.1

### Patch Changes

- 4f59252: pull latest Bluesky lexicons

## 2.0.0

### Major Changes

- a47373f: add `At.Identifier` string type

  an alias for either `At.DID` or `At.Handle`

- 813679f: add `At.Nsid` string type

  this is a specialized type for `nsid` formatted strings, where there were previously none.

- d3fbc7e: consistent casing on types and interfaces

  no more capitalized/pascalcase mixing, these following types are renamed:

  - `At.CID` → `At.Cid`
  - `At.CIDLink` → `At.CidLink`
  - `At.DID` → `At.Did`

- c7e8573: add `At.ResourceUri` string type

  this is a specialized type for `at-uri` formatted strings, replacing the previous `At.Uri` string

- 61bd8d2: add `At.GenericUri` string type

  this is a specialized type for `uri` formatted strings, where there were previously none.

### Minor Changes

- 13f35e4: allow passing ReadableStream and ArrayBuffer as input
- 45cfe46: add new response field, deprecating the old output field

### Patch Changes

- ecce2c6: pull latest Bluesky lexicons
- Updated dependencies [9d05dfd]
- Updated dependencies [13f35e4]
- Updated dependencies [a47373f]
- Updated dependencies [45cc699]
- Updated dependencies [2d10bd8]
- Updated dependencies [8aedcc5]
- Updated dependencies [45cfe46]
- Updated dependencies [813679f]
- Updated dependencies [24be9be]
- Updated dependencies [d3fbc7e]
- Updated dependencies [c7e8573]
- Updated dependencies [61bd8d2]
- Updated dependencies [87a99f1]
  - @atcute/client@3.0.0

## 1.0.15

### Patch Changes

- 298189f: pull latest Bluesky lexicons
