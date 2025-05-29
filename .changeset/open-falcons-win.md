---
'@atcute/lexicon-community': minor
'@atcute/whitewind': minor
'@atcute/bluemoji': minor
'@atcute/atproto': minor
'@atcute/bluesky': minor
'@atcute/ozone': minor
'@atcute/lex-cli': minor
---

bring back convenient interfaces for XRPC operations

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
