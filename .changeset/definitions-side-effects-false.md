---
'@atcute/lexicon-community': patch
'@atcute/standard-site': patch
'@atcute/whitewind': patch
'@atcute/microcosm': patch
'@atcute/frontpage': patch
'@atcute/bluemoji': patch
'@atcute/leaflet': patch
'@atcute/tangled': patch
'@atcute/atproto': patch
'@atcute/bluesky': patch
'@atcute/ozone': patch
'@atcute/germ': patch
'@atcute/pckt': patch
---

declare `sideEffects: false` so bundlers can tree-shake unused schema modules pulled in through the
barrel
