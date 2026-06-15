---
'@atcute/lexicons': patch
---

fix forward references in constrained arrays so schemas with circular definitions (such as
`app.bsky.draft.defs`) no longer throw a "cannot access before initialization" error on import
