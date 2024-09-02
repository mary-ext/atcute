#/usr/bin/env bash

# Currently we're just going to generate from these two lexicon documents,
# because the rest aren't complete yet and would fail type checking due to
# invalid references.

pnpm exec lex-cli generate \
	../../../lexicons-bluemoji/blue.moji/**/*.json \
	-o lib/lexicons.ts \
	--description "Contains type declarations for Bluemoji lexicons" \
	--banner "import '@atcute/bluesky/lexicons';"
