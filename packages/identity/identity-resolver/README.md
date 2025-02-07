# @atcute/identity-resolver

> [!NOTE]  
> not yet published.

atproto handle and DID document resolution

```ts
// handle resolution
const handleResolver = new CompositeHandleResolver({
	strategy: 'race',
	methods: {
		dns: new DohJsonHandleResolver({ dohUrl: 'https://mozilla.cloudflare-dns.com/dns-query' }),
		http: new WellKnownHandleResolver(),
	},
});

try {
	const handle = await didResolver.resolve('bsky.app');
	//    ^? 'did:plc:z72i7hdynmk6r22z27h6tvur'
} catch (err) {
	if (err instanceof DidNotFoundError) {
		// handle returned no did
	}
	if (err instanceof InvalidResolvedDidError) {
		// handle returned a did, but isn't a valid atproto did
	}
	if (err instanceof DuplicateResolvedDidError) {
		// handle returned multiple did values (duplicate dns entries)
	}
	if (err instanceof FailedDidResolutionError) {
		// handle resolution had thrown something unexpected (fetch error)
	}

	if (err instanceof HandleResolutionError) {
		// the errors above extend this class, so you can do a catch-all.
	}
}

// did doc resolution
const didResolver = new CompositeDidResolver({
	methods: {
		plc: new PlcDidResolver(),
		web: new WebDidResolver(),
	},
});

const doc = await didResolver.resolve('did:plc:z72i7hdynmk6r22z27h6tvur');
//    ^? { '@context': [...], id: 'did:plc:z72i7hdynmk6r22z27h6tvur', ... }
```
