# @atcute/lexicons

## 1.2.4

### Patch Changes

- 630623c: pass default TItem type to NullableSchema

## 1.2.3

### Patch Changes

- 2e2159b: add type for atproto audience

## 1.2.2

### Patch Changes

- 17c6f4a: fix recursive type error

  messed up how I implemented Standard Schema support.

- b30da0e: add `declarationMap` to tsconfig

## 1.2.1

### Patch Changes

- c7355a6: fix TypeScript go-to definition not working on validation schemas
- 171d74f: remove internal kObjectType field

## 1.2.0

### Minor Changes

- 4edc2e4: Standard Schema support
- 2391db5: improved tree-shaking for validation error formatting

### Patch Changes

- 87953c2: consistent object shape for the internal Ok<T> interface

## 1.1.1

### Patch Changes

- 394080c: fix missing NO_SIDE_EFFECTS marker on some validation exports

## 1.1.0

### Minor Changes

- 5383f0c: JIT-compiled object validation

  this doesn't eek out as much performance as I hoped, but the added code was small enough that it
  seemed okay to add.

  this optimization requires the runtime environment to allow the use of `eval()`/`new Function()`,
  and generates an unrolled validation loop.

### Patch Changes

- dee1e70: fix faulty UTF-16 fast-path constraint validation
- cfbbc3e: fix handle syntax conformance
- c061b2a: slight perf optimization to record validation
- 7b590bd: mark generic URIs over 8192 UTF-8 characters as invalid
- 19731f4: fix missing root path on validation errors
- aafe153: return literal enum error if variant is closed

## 1.0.4

### Patch Changes

- a2dbb16: missing `expected` string at the start of constraint validation errors
- 9ef363f: fix optional defaults not being set properly

## 1.0.3

### Patch Changes

- 76ced03: fix development-only assertion

## 1.0.2

### Patch Changes

- 61b0fd1: remove pure annotation from isArray

## 1.0.1

### Patch Changes

- 6abad75: attempt ASCII-only fast-path for UTF-8 length checking
- 5310da3: avoid missing key check if optional
- 3125bf6: optional type parameters for optional and array schema, and xrpc metadata
- 5ec9a3c: avoid in operator when validating variants
- 69db9c7: include expected content-type in xrpc operation schema
