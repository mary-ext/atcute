# @atcute/identity-resolver-node

Node.js handle resolver using native DNS.

```sh
npm install @atcute/identity-resolver-node
```

provides `NodeDnsHandleResolver` which resolves handles via DNS TXT records using Node.js's native
`dns` module, avoiding the need for HTTP-based resolution.

## usage

```ts
import { CompositeHandleResolver, WellKnownHandleResolver } from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';

const handleResolver = new CompositeHandleResolver({
	strategy: 'race',
	methods: {
		dns: new NodeDnsHandleResolver(),
		http: new WellKnownHandleResolver(),
	},
});

const did = await handleResolver.resolve('bsky.app');
// -> 'did:plc:z72i7hdynmk6r22z27h6tvur'
```

### custom nameservers

```ts
const resolver = new NodeDnsHandleResolver({
	nameservers: ['8.8.8.8', '8.8.4.4'],
});
```
