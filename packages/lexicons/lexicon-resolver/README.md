# @atcute/lexicon-resolver

atproto lexicon authority resolution

```ts
// authority resolution
const authorityResolver = new DohJsonLexiconAuthorityResolver({
	dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query',
});

try {
	const authority = await authorityResolver.resolve('app.bsky.feed.post');
	//    ^? 'did:plc:4v4y5r3lwsbtmsxhile2ljac'
} catch (err) {
	if (err instanceof AuthorityNotFoundError) {
		// nsid returned no did
	}
	if (err instanceof InvalidResolvedAuthorityError) {
		// nsid returned a did, but isn't a valid atproto did
	}
	if (err instanceof AmbiguousAuthorityError) {
		// nsid returned multiple did values
	}
	if (err instanceof FailedAuthorityResolutionError) {
		// nsid resolution had thrown something unexpected (fetch error)
	}

	if (err instanceof LexiconAuthorityResolutionError) {
		// the errors above extend this class, so you can do a catch-all.
	}
}
```
