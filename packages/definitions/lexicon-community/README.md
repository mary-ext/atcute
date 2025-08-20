# @atcute/lexicon-community

[Lexicon Community](https://github.com/lexicon-community/lexicon) (community.lexicon.\*) schema
definitions

## usage

```ts
import { CommunityLexiconCalendarEvent } from '@atcute/lexicon-community';
import { is } from '@atcute/lexicons';

const record: CommunityLexiconCalendarEvent.Main = {
	$type: 'community.lexicon.calendar.event',
	name: 'DoD Stammtisch May 2025',
	description: 'The last Stammtisch before @protocol.berlin v2',
	status: 'community.lexicon.calendar.event#scheduled',
	mode: 'community.lexicon.calendar.event#inperson',
	startsAt: '2025-05-21T17:00:00.000Z',
	createdAt: '2025-05-14T23:13:18.129Z',
	locations: [
		{
			$type: 'community.lexicon.location.address',
			name: '@c-base.org',
			country: 'DE',
			locality: 'Berlin',
			region: 'Berlin',
			street: 'Rungestrasse 20',
			postalCode: '10179',
		},
	],
};

is(CommunityLexiconCalendarEvent.mainSchema, record);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/lexicon-community"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/lexicon-community" />
```

```ts
// index.ts
import type {} from '@atcute/lexicon-community';
```

now all the XRPC operations should be visible in the client

## with `@atcute/lex-cli`

when building your own lexicons that reference Lexicon Community types, configure lex-cli to import
from this package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	mappings: [
		{
			nsid: ['community.lexicon.*'],
			imports: (nsid) => {
				const specifier = nsid.slice('community.lexicon.'.length).replaceAll('.', '/');
				return { type: 'namespace', from: `@atcute/lexicon-community/types/${specifier}` };
			},
		},
	],
});
```
