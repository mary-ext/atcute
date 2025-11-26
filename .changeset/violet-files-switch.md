---
'@atcute/lex-cli': patch
---

add config auto-discovery

given that config files are pretty much a required part of lex-cli, the CLI tool now attempts to
search for the presence of `lex.config.js` or `lex.config.ts` when a config file is not explicitly
specified.
