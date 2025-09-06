# @atcute/lexicon-doc

## 1.1.1

### Patch Changes

- a025873: change the return type of `findExternalReferences`

  this is a breaking change, I've made the mistake of shipping this function too early. it will now
  return the full NSID + definition IDs, instead of just NSIDs. it's also now returned as a set
  instead of a sorted array.

- a025873: make `findExternalReferences` walk a sibling's definitions if referenced
- a025873: add an optional definition ID parameter to `findExternalReferences`

  this will let you view all the external references from a specific schema definition instead of
  the whole schema.

## 1.1.0

### Minor Changes

- 29f8857: `findExternalReferences` function for extracting all external references from a document

## 1.0.3

### Patch Changes

- d17735e: fix faulty UTF-16 fast-path constraint validation

## 1.0.2

### Patch Changes

- 3efa702: validate default/const/known values with the given constraints

## 1.0.1

### Patch Changes

- 2249c88: validate mime-type/encoding in xrpc body
