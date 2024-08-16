#/usr/bin/env bash

pnpm exec lex-cli generate-main \
	../../../lexicons/com/atproto/**/*.json \
	-o lib/lexicons.ts \
	--description "Contains type declarations for AT Protocol lexicons"
