# @atcute/bluemoji

[Bluemoji](https://github.com/aendra-rininsland/bluemoji) (blue.moji.\*) schema definitions

```sh
npm install @atcute/bluemoji
```

## usage

```ts
import { BlueMojiCollectionItem } from '@atcute/bluemoji';
import { is } from '@atcute/lexicons';

const record: BlueMojiCollectionItem.Main = {
	$type: 'blue.moji.collection.item',
	name: 'nyoron',
	alt: '',
	createdAt: '2024-08-18T15:20:49.297Z',
	formats: {
		$type: 'blue.moji.collection.item#formats_v0',
		png_128: {
			$type: 'blob',
			ref: {
				$link: 'bafkreif32i7xs4ltlattqepkodgsqt5o7j44bfwdigjdz3u7vrgim4xwwm',
			},
			mimeType: 'image/png',
			size: 11624,
		},
		original: {
			$type: 'blob',
			ref: {
				$link: 'bafkreif32i7xs4ltlattqepkodgsqt5o7j44bfwdigjdz3u7vrgim4xwwm',
			},
			mimeType: 'image/png',
			size: 11624,
		},
		webp_128: {
			$type: 'blob',
			ref: {
				$link: 'bafkreichujvpqyapxnke5uj7mc7p6k5kqprtxbfssstoj6xjh36kcetjoe',
			},
			mimeType: 'image/webp',
			size: 8294,
		},
	},
};

is(BlueMojiCollectionItem.mainSchema, record);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/bluemoji"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/bluemoji" />
```

```ts
// index.ts
import type {} from '@atcute/bluemoji';
```

now all the XRPC operations should be visible in the client

### with `@atcute/lex-cli`

when building your own lexicons that reference Bluemoji types, configure lex-cli to import from this
package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/bluemoji'],
});
```
