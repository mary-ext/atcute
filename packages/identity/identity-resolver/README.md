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
	if (err instanceof InvalidResolvedHandleError) {
		// handle returned a did, but isn't a valid atproto did
	}
	if (err instanceof AmbiguousHandleError) {
		// handle returned multiple did values (duplicate dns entries)
	}
	if (err instanceof FailedHandleResolutionError) {
		// handle resolution had thrown something unexpected (fetch error)
	}

	if (err instanceof HandleResolutionError) {
		// the errors above extend this class, so you can do a catch-all.
	}
}

// DID document resolution
const docResolver = new CompositeDidDocumentResolver({
	methods: {
		plc: new PlcDidDocumentResolver(),
		web: new WebDidDocumentResolver(),
	},
});

try {
	const doc = await docResolver.resolve('did:plc:z72i7hdynmk6r22z27h6tvur');
	//    ^? { '@context': [...], id: 'did:plc:z72i7hdynmk6r22z27h6tvur', ... }
} catch (err) {
	if (err instanceof DocumentNotFoundError) {
		// did returned no document
	}
	if (err instanceof UnsupportedDidMethodError) {
		// resolver doesn't support did method (composite resolver)
	}
	if (err instanceof ImproperDidError) {
		// resolver considers did as invalid (atproto did:web)
	}
	if (err instanceof FailedDocumentResolutionError) {
		// document resolution had thrown something unexpected (fetch error)
	}

	if (err instanceof HandleResolutionError) {
		// the errors above extend this class, so you can do a catch-all.
	}
}
```
