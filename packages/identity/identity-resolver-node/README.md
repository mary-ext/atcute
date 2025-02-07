# @atcute/identity-resolver-node

> [!NOTE]  
> not yet published.

additional atproto identity resolvers for Node.js

```ts
// handle resolution
const handleResolver = new CompositeHandleResolver({
	strategy: 'race',
	methods: {
		dns: new NodeDnsHandleResolver(),
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
		// handle returned multiple did values
	}
	if (err instanceof FailedHandleResolutionError) {
		// handle resolution had thrown something unexpected (fetch error)
	}

	if (err instanceof HandleResolutionError) {
		// the errors above extend this class, so you can do a catch-all.
	}
}
```
