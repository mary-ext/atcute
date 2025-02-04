# @atcute/did-resolver

> [!NOTE]  
> not yet published.

atproto DID document resolution

```ts
const resolver = new CompositeDidResolver({
	methods: {
		plc: new PlcDidResolver(),
		web: new WebDidResolver(),
	},
});

const doc = await resolver.resolve('did:plc:ia76kvnndjutgedggx2ibrem');
//    ^? { '@context': [...], id: 'did:plc:ia76kvnndjutgedggx2ibrem', ... }
```
