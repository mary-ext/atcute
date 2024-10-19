# @atcute/bluemoji

[Bluemoji](https://github.com/aendra-rininsland/bluemoji) type definitions for `@atcute/client`, a
lightweight and cute API client for AT Protocol.

## usage

you'd need to import `@atcute/bluemoji/lexicons` into your project, either by adding it into the
`types` field in `tsconfig.json` or by importing it on your source code.

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/bluemoji/lexicons"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/bluemoji/lexicons" />
```

```ts
// index.ts
import '@atcute/bluemoji/lexicons';
```

newly added lexicons are augmented to `@atcute/client/lexicons` module
