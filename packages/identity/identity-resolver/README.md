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

const handle = await didResolver.resolve('bsky.app');
//    ^? 'did:plc:z72i7hdynmk6r22z27h6tvur'

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
