#/usr/bin/env bash

pnpm exec lex-cli generate \
	../../../lexicons/tools/ozone/**/*.json \
	-o lib/lexicons.ts \
	--description "Contains type declarations for Ozone lexicons" \
	--banner "import '@atcute/bluesky/lexicons';"
