# @atcute/lexicon-community

## 1.1.0

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

### Patch Changes

- Updated dependencies [e8592d0]
  - @atcute/atproto@3.1.0

## 1.0.1

### Patch Changes

- e2d3d00: ensure object properties, enums, and other sortable items are sorted
- Updated dependencies [e2d3d00]
- Updated dependencies [1b1bd64]
- Updated dependencies [61b0fd1]
  - @atcute/atproto@3.0.2
  - @atcute/lexicons@1.0.2
