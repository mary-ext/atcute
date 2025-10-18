---
'@atcute/lex-cli': minor
'@atcute/atproto': patch
'@atcute/bluesky': patch
'@atcute/bluemoji': patch
'@atcute/frontpage': patch
'@atcute/leaflet': patch
'@atcute/lexicon-community': patch
'@atcute/ozone': patch
'@atcute/tangled': patch
'@atcute/whitewind': patch
---

add package.json-based lexicon import metadata

instead of manually configuring mappings:

```js
mappings: [
	{
		nsid: ['com.atproto.*'],
		imports: (nsid) => {
			const specifier = nsid.slice('com.atproto.'.length).replaceAll('.', '/');
			return { type: 'namespace', from: `@atcute/atproto/types/${specifier}` };
		},
	},
];
```

you can now simply write:

```js
imports: ['@atcute/atproto'];
```

the package metadata is automatically discovered and used for import resolution.

for lexicon definition packages, add an `atcute:lexicons` field to your package.json with NSID
patterns mapped to import paths:

```json
{
	"atcute:lexicons": {
		"mapping": {
			"com.atproto.*": {
				"type": "namespace",
				"path": "./types/{{nsid_remainder}}"
			}
		}
	}
}
```

the CLI discovers these mappings from packages listed in the `imports` array. available template
expansions:

- `./` at the start of the path is replaced with the package name (e.g., `./types/foo` becomes
  `@atcute/atproto/types/foo`)
- `{{nsid}}` is replaced with the full NSID (e.g., `com/atproto/sync/subscribeRepos`)
- `{{nsid_prefix}}` is replaced with the part before the wildcard (e.g., `com/atproto`)
- `{{nsid_remainder}}` is replaced with the part after the prefix (e.g., `sync/subscribeRepos`)
