---
'@atcute/lex-cli': patch
---

migrate the internal config and metadata schemas from `@badrap/valita` to `valibot`. the
`defineLexiconConfig` helper and exported `LexiconConfig` / `SourceConfig` / `FormatterConfig` /
etc. type aliases are now derived from valibot schemas — they remain structurally compatible, but
`LexiconConfig` is now defined as a TypeScript interface (to keep type inference tractable through
the deeply nested config schema) rather than via `v.Infer`.
