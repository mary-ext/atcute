# @atcute/lexicon-resolver

resolve lexicon schemas from the AT Protocol network.

```sh
npm install @atcute/lexicon-resolver
```

## usage

### resolving lexicon authority

find which DID is authoritative for an NSID via DNS TXT records:

```ts
import { DohJsonLexiconAuthorityResolver } from '@atcute/lexicon-resolver';

const authorityResolver = new DohJsonLexiconAuthorityResolver({
	dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query',
});

const authority = await authorityResolver.resolve('app.bsky.feed.post');
// -> 'did:plc:4v4y5r3lwsbtmsxhile2ljac'
```

### fetching lexicon schemas

retrieve the lexicon document from an authority's PDS:

```ts
import {
	CompositeDidDocumentResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
} from '@atcute/identity-resolver';
import { LexiconSchemaResolver } from '@atcute/lexicon-resolver';

const schemaResolver = new LexiconSchemaResolver({
	didDocumentResolver: new CompositeDidDocumentResolver({
		methods: {
			plc: new PlcDidDocumentResolver(),
			web: new WebDidDocumentResolver(),
		},
	}),
});

const resolved = await schemaResolver.resolve(authority, 'app.bsky.feed.post');
// -> { uri: string, cid: string, rawSchema: unknown, schema: LexiconDoc }
```

### error handling

```ts
import {
	AuthorityNotFoundError,
	InvalidResolvedAuthorityError,
	LexiconAuthorityResolutionError,
	InvalidLexiconSchemaError,
	LexiconResolutionError,
} from '@atcute/lexicon-resolver';

try {
	await authorityResolver.resolve(nsid);
} catch (err) {
	if (err instanceof LexiconAuthorityResolutionError) {
		// authority resolution failed
	}
}

try {
	await schemaResolver.resolve(authority, nsid);
} catch (err) {
	if (err instanceof LexiconResolutionError) {
		// schema resolution failed
	}
}
```
