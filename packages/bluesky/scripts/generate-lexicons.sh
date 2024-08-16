#/usr/bin/env bash

pnpm exec lex-cli generate \
	../../lexicons/app/bsky/**/*.json \
	-o lib/lexicons.ts \
	--description "Contains type declarations for Bluesky lexicons"
