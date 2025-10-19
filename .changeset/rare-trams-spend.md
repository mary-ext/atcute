---
'@atcute/atproto': patch
'@atcute/bluesky': patch
'@atcute/bluemoji': patch
'@atcute/frontpage': patch
'@atcute/leaflet': patch
'@atcute/lexicon-community': patch
'@atcute/ozone': patch
'@atcute/tangled': patch
'@atcute/whitewind': patch
---

add `atcute:lexicons` metadata to package.json

all lexicon definition packages now include the `atcute:lexicons` field with namespace mappings,
enabling automatic import resolution when used with `@atcute/lex-cli`'s `imports` configuration.
