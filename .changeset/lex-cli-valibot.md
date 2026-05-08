---
'@atcute/lex-cli': patch
---

migrate the internal config and metadata schemas from `@badrap/valita` to `valibot`. the
`defineLexiconConfig` helper and exported `LexiconConfig` / `SourceConfig` / `FormatterConfig` /
etc. type aliases are now derived from valibot schemas; they remain structurally compatible.
