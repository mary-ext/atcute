#/usr/bin/env bash

pnpm exec lex-cli generate \
	../../../lexicons-whtwnd/com/whtwnd/**/*.json \
	-o lib/lexicons.ts \
	--description "Contains type declarations for WhiteWind lexicons"
