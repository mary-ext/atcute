# @atcute/util-text-native

drop-in native replacement for [`@atcute/util-text`](../util-text), backing grapheme counting with a
prebuilt C addon on Node.js and falling back to the same pure-JS implementation everywhere else (or
when no prebuilt binary matches the platform).

this package is not imported directly. instead, override `@atcute/util-text` so every consumer in
the tree picks up the native variant:

```jsonc
// package.json
{
	"pnpm": {
		"overrides": {
			"@atcute/util-text": "npm:@atcute/util-text-native@^1",
		},
	},
}
```

the public API (`getGraphemeLength`, `isGraphemeLengthInRange`) is identical, so nothing else
changes.

prebuilt binaries ship for linux (glibc/musl, x64/arm64), darwin-arm64, and win32-x64. on any other
platform the JS fallback is used transparently.
