# @atcute/ozone

[Ozone](https://ozone.tools) (tools.ozone.\*) schema definitions

## usage

```ts
import { is, type $type } from '@atcute/lexicons';
import { ToolsOzoneModerationDefs } from '@atcute/ozone';

type LabelEvent = $type.enforce<ToolsOzoneModerationDefs.ModEventLabel>;

const evt: LabelEvent = {
	$type: 'tools.ozone.moderation.defs#modEventLabel',
	createLabelVals: ['awesome'],
	negateLabelVals: [],
};

is(ToolsOzoneModerationDefs.modEventLabelSchema, evt);
// -> true
```

### with `@atcute/client`

pick either one of these 3 options to register the ambient declarations

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["@atcute/ozone"],
	},
}
```

```ts
// env.d.ts
/// <reference types="@atcute/ozone" />
```

```ts
// index.ts
import type {} from '@atcute/ozone';
```

now all the XRPC operations should be visible in the client

```ts
import { Client, simpleFetchHandler } from '@atcute/client';

const client = new Client({
	handler: simpleFetchHandler({ service: 'https://mod.example.com' }),
});

const response = await client.post('tools.ozone.moderation.emitEvent', {
	input: {
		createdBy: 'did:plc:ia76kvnndjutgedggx2ibrem',
		subject: {
			$type: 'com.atproto.repo.strongRef',
			uri: 'at://did:plc:ia76kvnndjutgedggx2ibrem/app.bsky.feed.post/3l6uo5yecnsu7',
			cid: 'bafyreibluyqpqno2ixrhdkztquyarpug7k6t4en6ug7g3sw6fonzzmakbq',
		},
		event: {
			$type: 'tools.ozone.moderation.defs#modEventLabel',
			createLabelVals: ['awesome'],
			negateLabelVals: [],
		},
	},
});
// ...
```

### with `@atcute/lex-cli`

when building your own lexicons that reference Ozone types, configure lex-cli to import from this
package:

```ts
// file: lex.config.js
import { defineLexiconConfig } from '@atcute/lex-cli';

export default defineLexiconConfig({
	files: ['lexicons/**/*.json'],
	outdir: 'src/lexicons/',
	imports: ['@atcute/ozone'],
});
```
